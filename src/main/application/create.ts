import * as vscode from 'vscode';
import { SDK } from '../sdk'
import { join, parse, resolve,sep } from 'path';
import * as glob from "glob";
 interface ISampleList {
    [key: string]: string | ISampleList;
}
export class Application {
    // 打开应用项目
    public static async getSmaples() {
        const sdk = (await SDK.get("sdk")) || "";
        // 查看含有 sample.list 的 board
        const samplePathGlob = join(sdk, "samples", "boards", "*", "sample.list");
        const sampleFiles = glob.sync(samplePathGlob, {});
        const boardsSampleList: ISampleList = {};
        for (const file of sampleFiles) {
            const board = resolve(parse(file).dir).split(sep).pop();
            if (board) {
                boardsSampleList[board] = file;
            }
        }
        // 选择 board (当board仅一个时，跳过选择)
        const boards = Object.keys(boardsSampleList);
        // let board = boards[0];
        console.log(boards)

    }

}
