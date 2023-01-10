import * as path from 'path';
import * as vscode from 'vscode';
import { pathExists } from 'fs-extra';
import { CreatePanel, Page } from '@/utils/panel';
import memory from './memory';
/**
 * Memory Report
 * 内存报告
 */
export class CreateReportPanel extends CreatePanel {
    _data: any;
    constructor(extensionPath: string, pageData: Page) {
        super(extensionPath, pageData);
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(async message => {
            console.log(message);
            const self = this;
            switch (message.type) {
                case 'mounted':
                    self.panel.webview.postMessage({
                        type: 'treeData',
                        data: this._data
                    });
                    return;
                case 'openFile':
                    const { path, line } = message.data;
                    console.log(path);
                    if (! await pathExists(path)) {
                        return;
                    }
                    const lineNum = line - 1 || 0;
                    const options = {
                        selection: new vscode.Range(new vscode.Position(lineNum, 0), new vscode.Position(lineNum, 0)),
                        // 是否预览，默认true，预览的意思是下次再打开文件是否会替换当前文件
                        preview: false,
                        // 显示在第二个编辑器
                        viewColumn: vscode.ViewColumn.Two

                    };
                    vscode.window.showTextDocument(vscode.Uri.file(path), options);

                    return;

            }
        }, null, this.disposables);

    }
    async sendData() {
        const data = await this.showLoading();
        this._data = data;
        this.panel.webview.postMessage({
            type: 'treeData',
            data: data
        });
    }
    async showLoading() {
        const data: any = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
        }, async (progress) => {
            progress.report({
                message: `Generating memory reports ...`,
            });
            try {
                return await memory.getData();
            } catch (e) {
                throw new Error(`${e}`);
            }

        });
        return data;
        // await this.createOrShow(extensionPath, data)
    }
}
