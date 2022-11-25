import * as vscode from 'vscode';
import { SDK } from '../sdk';
import { join, parse, resolve, sep } from 'path';
import { pathExists, createReadStream } from "fs-extra";
import { createInterface } from 'readline';
import { once } from "events";
import { execa } from 'execa';
import * as glob from "glob";
import { Command } from '../../main/command';

interface Sample {
    name: string;
    path: string;
    sample: string,
    http_url_to_repo?: string,
}

interface ISampleList {
    [key: string]: string | ISampleList;
}

export async function path2json(dirParse: Array<string>, json: ISampleList): Promise<ISampleList> {
    if (!dirParse.length) return json;
    const dir = dirParse.shift();
    // console.log(dir, json)
    if (dir) {
        if (typeof json[dir] === 'string') {
            return json;
        }
        json[dir] = dirParse.length ? await path2json(dirParse, (json[dir] || {}) as ISampleList) : dir;
    } else {
        return await path2json(dirParse, json);
    }
    return json;
}


export class Application {
    static treeData: string[] = [];
    static str: string;
    static sdk: string;
    static createProcess: any;

    static iterate(obj: { [x: string]: any; }, stack?: string) {
        for (var property in obj) {
            if (typeof obj[property] == "object") {
                Application.str = stack !== undefined ? (stack + sep + property) : property;
                Application.iterate(obj[property], Application.str);
            } else {
                Application.str = stack !== undefined ? (stack + sep + property) : property;
                Application.treeData.push(Application.str);
            }
        }
    }
    // 打开应用项目
    public static async getSmaples() {
        const sdk = (await SDK.get("sdk")) || "";
        this.sdk = sdk;
        const env = (await SDK.get("env")) || "";
        const board = (env && env[0]) || "";
        // 查看含有 sample.list 的 board
        if (!sdk) {
           return vscode.window.showErrorMessage('请先安装CSK SDK （lisa zep sdk）')
        }
        const sampleListPath = join(sdk, "samples", "boards", board, "sample.list");
        const sampleListFile = resolve(sampleListPath as string);
        if (!(await pathExists(sampleListFile))) {
            throw new Error(`当前 SDK 的 ${board} 暂不支持 create 项目`);
        }
        console.log('sampleListFile--->', sampleListFile);
        // 解析sampleListFile 按文件夹的json结构
        let sampleList: string[] = [];
        const rl = createInterface({
            input: createReadStream(sampleListFile),
        });
        rl.on("line", async (line) => {
            line = line.trim();
            if (line && !line.startsWith("#")) {
                line = !line.endsWith("*")
                    ? resolve(sdk, line, "./**/CMakeLists.txt")
                    : resolve(sdk, `${line}*`, "./CMakeLists.txt");
                sampleList.push(resolve(line));
            }
        });
        await once(rl, "close");
        let sampleListJson: ISampleList = {};
        for (const samplePath of sampleList) {
            const files = glob.sync(samplePath);
            for (const file of files) {
                const dirParse = resolve(parse(file).dir)
                    .replace(join(sdk, "samples"), "")
                    .split(sep);
                sampleListJson = await path2json(dirParse, sampleListJson);
            }
        }
        console.log('sampleListJson--->', sampleListJson);
        Application.treeData = [];
        Application.iterate(sampleListJson);
        return Application.treeData;

    }
    //预览smaple的readme
    public static async showSmaples(obj: { path: string, url?: string; }) {
        const { path, url } = obj;
        if (url) {
            vscode.env.openExternal(vscode.Uri.parse(url));
            return;
        }
        const readmePath = resolve(this.sdk, "samples", path, 'README.rst');
        if (! await pathExists(readmePath)) {
            vscode.window.showErrorMessage(`该Sample不支持预览`);
            return;
        }
        const uri = vscode.Uri.file(readmePath);
        const options = {
            // 是否预览，默认true，预览的意思是下次再打开文件是否会替换当前文件
            preview: true,
            // 显示在第二个编辑器
            viewColumn: vscode.ViewColumn.Two

        };
        vscode.window.showTextDocument(uri, options);
        setTimeout(() => { vscode.commands.executeCommand('rst.showPreview'); }, 300);
    }
    // 创建应用
    public static async createSample(sampleData: Sample) {
        const { name, path, sample, http_url_to_repo } = sampleData;
        const target = resolve(path, name);
        let subprocess;
        try {
            if (http_url_to_repo) {
                //create from-git
                console.log(target, http_url_to_repo);
                subprocess = execa('lisa', ['zep', 'create', target, '--from-git', http_url_to_repo], {
                    stdio: 'inherit'
                });
            } else {
                const samplePath = resolve(this.sdk, "samples", sample);
                //create from smaple
                subprocess = execa('lisa', ['zep', 'create', target, '--from', samplePath], {
                    stdio: 'inherit'
                });
            }
            Application.createProcess = subprocess;
            await subprocess;
            await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(target), { forceNewWindow: true });
            return `应用创建成功（${target}）`;
        } catch {
            return `创建失败，请重试`;
        }

    }
    //编译
    public static async buildApp(path: string | undefined) {
        let board: string = '';
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Building...",
            cancellable: false,
        }, async (_progress) => {
            board = await this.getBoard();
            console.log('board--->', board);
            if (!board) {
                vscode.window.showWarningMessage('暂未设置开发板型', {}, ...["配置"]).then(async () => {
                    vscode.commands.executeCommand('csk-application-basic.create-application-setting');
                });
            } else {
                try {
                    await Command.run('app', 'lisa zep build');
                } catch (error) {
                    console.log(error);
                    vscode.window.showErrorMessage("编译失败，请重试");

                }

            }
        });

    }
    //设置板型
    public static async setBoard(val: string) {
        await execa('lisa', ['zep', 'config', 'build.board', val]);
    };
    //获取板型
    public static async getBoard() {
        try {
            const { stdout } = await execa('lisa', ['zep', 'config', 'build.board']);
            return stdout || '';
        } catch (error) {
            console.log(error);
            return '';

        }

    };
    //获取板子列表
    public static async getBoardList() {
        console.time("getBoards");
        const { stdout } = await execa('lisa', ['zep', 'boards']);
        console.timeEnd("getBoards");
        return stdout || '';
    };
}
//
