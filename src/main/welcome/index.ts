import * as vscode from 'vscode';
import { WelcomePanel } from './openHome';
import { pathExists } from 'fs-extra';
import * as path from 'path';
export class Welcome {
    // 打开Home page
    public static async openHomePage(context: vscode.ExtensionContext) {
        await WelcomePanel.createOrShow(context.extensionPath);
    }
    // 打开应用项目
    public static async openApplication() {
        vscode.window.showOpenDialog({
            canSelectFiles: false, // 是否可选文件
            canSelectFolders: true, // 是否可选文件夹
            canSelectMany: false, // 是否可以选择多个
            openLabel: '确定'
        }).then(async function (msg) {
            if (msg && msg[0]) {
                const uri = vscode.Uri.parse(`${msg[0].scheme}://${msg[0].path}`);
                const hasCmakeFile: boolean = await pathExists(path.join(msg[0].fsPath, 'CMakeLists.txt'));
                const hasPconfFile: boolean = await pathExists(path.join(msg[0].fsPath, 'prj.conf'));
                if (hasCmakeFile || hasPconfFile) {
                    await vscode.commands.executeCommand('vscode.openFolder', uri);
                } else {
                    vscode.window.showWarningMessage(`"${msg[0].path} "该目录不包含application source.`)
                }
            }
        });
        
    }
    //创建应用项目
    public static async createApplication() {
        const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
        console.log(terminals);
        const items: vscode.Terminal | undefined = terminals.find(t =>
            t.name === 'lisa Terminal'
        );
        let terminal = items ? items : vscode.window.createTerminal(`lisa Terminal`);
        terminal.show(true);
        terminal.sendText('lisa zep sdk create');

    }
    // 查看开发文档
    public static openDocument(url: string) {
        vscode.env.openExternal(vscode.Uri.parse(url));
    }
    // 本机开发信息
    public static async getZepInfo() {
        const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
        console.log(terminals);
        const items: vscode.Terminal | undefined = terminals.find(t =>
            t.name === 'lisa Terminal'
        );
        items && items.dispose();
        let terminal = vscode.window.createTerminal(`lisa Terminal`);
        terminal.show(true);
        terminal.sendText('lisa info zep');

    }
}
