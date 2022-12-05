
/**
 * Application setting
 * 应用配置
 * 
 */
import { CreatePanel, Page } from '../../utils/panel';
import * as vscode from 'vscode';
import { Application } from './create';
import { pathExists, remove } from 'fs-extra';
import * as path from 'path';

export class CreateSettingPanel extends CreatePanel {
    board: string | undefined;
    constructor(extensionPath: string, pageData: Page) {
        super(extensionPath, pageData);
        const self = this;
        this.panel.webview.onDidReceiveMessage(async message => {
            switch (message.type) {
                case 'getBoards':
                    console.log('getBoards--->');
                    const res: string = await Application.getBoardList();
                    const board: string = await Application.getBoard();
                    this.board = board;
                    self.panel.webview.postMessage({
                        type: "getBoards",
                        data: {
                            list: res.split(/\r?\n/),
                            board: board || '',
                        }
                    });

                    break;
                case 'saveApplicationSetting':
                    try {
                        const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
                            ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
                        const hasBuildDir: boolean = !!(rootPath && await pathExists(path.resolve(rootPath, 'build')));
                        if (hasBuildDir) {
                            const options: vscode.MessageOptions = { detail: '该应用已存在编译目录，切换版型后将清除编译产物目录，', modal: true };
                            vscode.window.showInformationMessage('是否确认切换应用版型', options, ...["确定"]).then(async (val) => {
                                if (val === '确定') {
                                    rootPath && await remove(path.resolve(rootPath, 'build'));
                                    this.board = message.data.board;

                                    await Application.setBoard(message.data.board);
                                    vscode.window.showInformationMessage('设置成功');
                                }
                                self.panel.webview.postMessage({
                                    type: "saveApplicationSetting",
                                    data: self.board
                                });
                            });
                        } else {
                            await Application.setBoard(message.data.board);
                            this.board = message.data.board;
                            vscode.window.showInformationMessage('设置成功');
                            self.panel.webview.postMessage({
                                type: "saveApplicationSetting",
                                data: self.board
                            });
                        }

                    } catch {
                        vscode.window.showErrorMessage('设置失败,请重试');
                    }

                    break;
                default:
                    return;

            }
        }, null, this.disposables);

    }

}

