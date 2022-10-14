
/**
 * Application setting
 * 应用配置
 * 
 */
import { CreatePanel, Page } from '../../utils/panel';
import * as vscode from 'vscode';
import { Application } from './create'
export class CreateSettingPanel extends CreatePanel {
    constructor(extensionPath: string, pageData: Page) {
        super(extensionPath, pageData);
        const self = this;
        this.panel.webview.onDidReceiveMessage(async message => {
            switch (message.type) {
                case 'getBoards':
                    console.log('getBoards--->')
                    const res: string = await Application.getBoardList();
                    const board: string = await Application.getBoard();
                    self.panel.webview.postMessage({
                        type: "getBoards",
                        data: {
                            list: res.split(/\r?\n/),
                            board: board || ''
                        }
                    });

                    break;
                case 'saveApplicationSetting':
                    try {
                        await Application.setBoard(message.data.board);
                        vscode.window.showInformationMessage('设置成功')
                    } catch {
                        vscode.window.showErrorMessage('设置失败,请重试')
                    }
                    self.panel.webview.postMessage({
                        type: "saveApplicationSetting",
                        data:''
                    });
                    break;
                default:
                    return;

            }
        }, null, this.disposables);

    }

}

