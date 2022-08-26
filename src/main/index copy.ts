import * as path from 'path';
import * as vscode from 'vscode';
import { pathExists, readJSON } from 'fs-extra'
/**
 * Manages react webview panels
 */
export class ReactPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: ReactPanel | undefined;

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
        this._panel = vscode.window.createWebviewPanel(ReactPanel.viewType, "Report", column, {
            // Enable javascript in the webview
            enableScripts: true,

            // And restric the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
                vscode.Uri.file(this._buildPath)
            ]
        });

        // Set the webview's initial html content 
        this._panel.webview.html = this._getHtmlForWebview();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            console.log(message)
            switch (message.type) {
                case 'openFile':
                    const { path, line } = message.data;
                    const options = {
                        // 选中第3行第9列到第3行第17列
                        // selection: new vscode.Range(new vscode.Position(line, 1), new vscode.Position(line, 2)),
                        // 是否预览，默认true，预览的意思是下次再打开文件是否会替换当前文件
                        preview: false,
                        // 显示在第二个编辑器
                        viewColumn: vscode.ViewColumn.Two

                    };
                    vscode.window.showTextDocument(vscode.Uri.file(path), options);
                    // const setting: vscode.Uri = vscode.Uri.parse(path);
                    // vscode.workspace.openTextDocument(setting).then((a: vscode.TextDocument) => {
                    //     // vscode.window.showTextDocument(a, 1, false);
                    // }, (error: any) => {
                    //     console.error(error);
                    // });
                    return;

            }
        }, null, this._disposables);
    }


    // public static  async getMemoryData ()  {
    //     const workspaceFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
    //     const ramFile = workspaceFolder && path.join(workspaceFolder, 'build', 'ram.json')
    //     let ram = [];
    //     if (ramFile && await pathExists(ramFile)) {
    //         ram = await readJSON(ramFile)
    //     }
    //     return ram
    // }
    public static async createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        console.log('vscode createOrShow')

        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        if (ReactPanel.currentPanel) {
            ReactPanel.currentPanel._panel.reveal(column);
        } else {
            ReactPanel.currentPanel = new ReactPanel(extensionPath, column || vscode.ViewColumn.One);
            // }
            // const treeData = await ReactPanel.getMemoryData()
            const treeData = {}
            console.log('vscode send message')
            console.log(treeData)
            ReactPanel.currentPanel._panel.webview.postMessage({
                type: 'treeData',
                data: treeData
            });
        }
    }
    public async onView() {
        console.log(999)
        console.log('onView')

        // this.updateWebview();
    }
    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        console.log('dispose')
        ReactPanel.currentPanel = undefined;

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
            const buildPath = this._reactBuildPath;
            const manifest = require('ReactApp/asset-manifest.json');
            const mainScript = manifest['files']['main.js'];
            const mainStyle = manifest['files']['main.css'];
            const scriptPathOnDisk = vscode.Uri.file(path.join(buildPath, mainScript));
            const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
            const stylePathOnDisk = vscode.Uri.file(path.join(buildPath, mainStyle));
            const styleUri = stylePathOnDisk.with({ scheme: 'vscode-resource' });

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
				<base href="${vscode.Uri.file(path.join(this._extensionPath, 'build')).with({ scheme: 'vscode-resource' })}/">
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