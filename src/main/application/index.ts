import * as path from 'path';
import * as vscode from 'vscode';
import { Application } from './create'
/**
 * Manages react webview panels
 */
export class CreatePanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: CreatePanel | undefined;

    private static readonly viewType = 'react';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private readonly _buildPath: string;
    private readonly _reactBuildPath: string;


    private _disposables: vscode.Disposable[] = [];

    private constructor(extensionPath: string, column: vscode.ViewColumn) {
        this._extensionPath = extensionPath;
        this._buildPath = path.join(this._extensionPath, 'dist');
        this._reactBuildPath = path.join(this._extensionPath, 'dist', 'react-app');

        // Create and show a new webview panel
        this._panel = vscode.window.createWebviewPanel(CreatePanel.viewType, "新建应用 ", column, {
            // Enable javascript in the webview
            enableScripts: true,

            // And restric the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
                // Only allow the webview to access resources in our extension's media directory
                vscode.Uri.file(path.join(this._extensionPath, 'assets')),
                vscode.Uri.file(this._buildPath)
            ]
        });

        // Set the webview's initial html content 
        this._panel.webview.html = this._getHtmlForWebview();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.onDidChangeViewState((e) => {
            // this._onViewChange();
        });

        // Handle messages from the webview
        const self = this
        this._panel.webview.onDidReceiveMessage(async message => {
            console.log(message)
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
                            self._panel.webview.postMessage({
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
                    const res = await Application.getSmaples() ;
                    self._panel.webview.postMessage({
                        type: "getSamples",
                        data: res
                    });
                    break;
                case 'openSampleReadme':
                    Application.showSmaples(message.data);
                    break;
                case 'createApplication':
                    const msg:string =  await Application.createSample(message.data);
                    self._panel.webview.postMessage({
                        type: "createDone",
                        data: ''
                    });
                    vscode.window.showInformationMessage(msg)
                    break;
                    
                default:
                    return

            }
        }, null, this._disposables);

        // this._onMount();
    }


    public static async createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        if (CreatePanel.currentPanel) {
            CreatePanel.currentPanel._panel.reveal(column);
            // CreatePanel.currentPanel._panel.webview.postMessage({
            //     type: 'welcome',
            //     data: {}
            // });
        } else {
            CreatePanel.currentPanel = new CreatePanel(extensionPath, column || vscode.ViewColumn.One);
        }

    }

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        Application.createProcess && Application.createProcess.kill('SIGTERM', {
            forceKillAfterTimeout: 1000
        });
        CreatePanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview() {

        try {
            const stylePathOnDisk = vscode.Uri.file(path.join(this._reactBuildPath, 'assets', 'createApplication.css'));
            const styleUri = stylePathOnDisk.with({ scheme: 'vscode-resource' });
            const scriptPathOnDisk = vscode.Uri.file(path.join(this._reactBuildPath, 'js', 'createApplication.js'));
            const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
            // Use a nonce to whitelist which scripts can be run
            const nonce = getNonce();
            return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>React App</title>
				<link rel="stylesheet" type="text/css" href="${styleUri}">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
		
			</head>
			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
				<script nonce="${nonce}" >
                    var vscode = window.acquireVsCodeApi();
                </script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
                
			</body>
			</html>`;
        } catch (error) {
            console.log(error)
            return '';
        }

    }

}

function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}