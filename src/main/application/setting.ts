
/**
 * Application setting
 * 应用配置
 * 
 */
import { CreatePanel, Page } from '@/utils/panel';
import * as vscode from 'vscode';
import { Application } from './create';
import { pathExists, remove } from 'fs-extra';
import * as path from 'path';

export class CreateSettingPanel extends CreatePanel {
    board: string | undefined;
    runner: string | undefined;
    constructor(extensionPath: string, pageData: Page) {
        super(extensionPath, pageData);
        const self = this;
        this.panel.webview.onDidReceiveMessage(async message => {
            switch (message.type) {
                case 'getSettings':
                    try {
                        console.time("getSettings");
                        const list = await Application.getRunnerList();
                        const res: string = await Application.getBoardList();
                        const board: string = await Application.getBoard();
                        const runner: string = await Application.getRunner();
                        this.board = board;
                        this.runner = runner;
                        const data = {
                            runners: list,
                            list: res.split(/\r?\n/),
                            board: board || '',
                            runner: runner || '',
                        };
                        console.timeEnd("getSettings");
                        console.log(data);
                        self.panel.webview.postMessage({
                            type: "getSettings",
                            data
                        });

                    } catch (error: any) {
                        vscode.window.showErrorMessage('出错了，请重新打开配置页面');
                    }
                    break;
                case 'saveApplicationSetting':
                    try {
                        const rootPath = Application.workspace;
                        const hasBuildDir: boolean = !!(rootPath && await pathExists(path.resolve(rootPath, 'build')));
                        const { board, runner } = message.data;
                        console.log(message.data, board && hasBuildDir);
                        if (board && hasBuildDir) {
                            const options: vscode.MessageOptions = { detail: '该应用已存在编译目录，切换版型后将清除编译产物目录，', modal: true };
                            vscode.window.showInformationMessage('是否确认切换应用版型', options, ...["确定"]).then(async (val) => {
                                if (val === '确定') {
                                    rootPath && await remove(path.resolve(rootPath, 'build'));
                                    board && await Application.setBoard(board);
                                    runner && await Application.setRunner(runner);
                                    this.board = board || this.board;
                                    this.runner = runner || this.runner;
                                    vscode.window.showInformationMessage('设置成功');
                                    self.panel.webview.postMessage({
                                        type: "saveApplicationSetting",
                                        data: {
                                            board: self.board,
                                            runner: self.runner,
                                        }
                                    });
                                } else {
                                    self.panel.webview.postMessage({
                                        type: "saveApplicationSetting",
                                        data: {}
                                    });
                                }
                            });
                        } else {
                            board && await Application.setBoard(board);
                            runner && await Application.setRunner(runner);
                            this.board = board || this.board;
                            this.runner = runner || this.runner;
                            vscode.window.showInformationMessage('设置成功');
                            self.panel.webview.postMessage({
                                type: "saveApplicationSetting",
                                data: {
                                    board: self.board,
                                    runner: self.runner,
                                }
                            });
                        }
                    } catch (error: any) {
                        self.panel.webview.postMessage({
                            type: "saveApplicationSetting",
                            data: {}
                        });
                        vscode.window.showErrorMessage(error.message || '设置失败,请重试');
                    }


                    break;
                default:
                    return;

            }
        }, null, this.disposables);

    }

}

