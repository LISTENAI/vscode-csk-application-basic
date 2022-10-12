import * as vscode from 'vscode';
import { Application } from './create'
import { CreatePanel, Page } from '../../utils/panel';
import { CurrentWebviewPanels } from '../../extension';

/**
 * Application
 * 如何分辨是一个zephyr的应用
 * 有 CMakeLists.txt 或者 prj.conf文件
 */
export class CreateAppPanel extends CreatePanel {
    pageData: any
    constructor(extensionPath: string, pageData: Page) {
        
        super(extensionPath, pageData);
        this.pageData = pageData
        const self = this;
        this.panel.webview.onDidReceiveMessage(async message => {
            console.log(message);
            switch (message.type) {
                case 'openFolder':
                    vscode.window.showOpenDialog({
                        canSelectFiles: false, // 是否可选文件
                        canSelectFolders: true, // 是否可选文件夹
                        canSelectMany: false, // 是否可以选择多个
                        openLabel: '确定'
                    }).then(function (msg) {
                        if (msg && msg[0]) {
                            // const uri = vscode.Uri.parse(`${msg[0].scheme}://${msg[0].path}`);
                            self.panel.webview.postMessage({
                                type: "openFolder",
                                data: {
                                    fsPath: msg[0].fsPath,
                                    path: msg[0].path,
                                    scheme: msg[0].scheme
                                }
                            });

                        }
                    });
                    break;
                case 'getSamples':
                    const res = await Application.getSmaples();
                    self.panel.webview.postMessage({
                        type: "getSamples",
                        data: res
                    });
                    break;
                case 'openSampleReadme':
                    Application.showSmaples(message.data);
                    break;
                case 'createApplication':
                    const msg: string = await Application.createSample(message.data);
                    self.panel.webview.postMessage({
                        type: "createDone",
                        data: ''
                    });
                    vscode.window.showInformationMessage(msg);
                    break;

                default:
                    return;

            }
        }, null, this.disposables);
    }
    
    public dispose() {
        Application.createProcess && Application.createProcess.kill('SIGTERM', {
            forceKillAfterTimeout: 1000
        });
        CurrentWebviewPanels[this.pageData.assetsName] = null;
        CreatePanel.currentPanel = undefined;
        // Clean up our resources
        this.panel.dispose();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

}
