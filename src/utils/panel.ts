import * as path from 'path';
import * as vscode from 'vscode';
interface WebviewPanelModel {
    [propName: string]: any;
}
type Callback = () => void;
export interface Page {
    assetsName: string; //打包生成的静态资源名称
    title: string;//webview标题
}
/**
 * @pageData 生成的webview页面数据信息
 * 
 * 
 */
export class CreatePanel {

    public static currentPanel: CreatePanel | undefined;
    private static readonly viewType = 'react';
    public panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private readonly _buildPath: string;
    private readonly _reactBuildPath: string;
    private readonly _pageData: Page;

    public disposables: vscode.Disposable[] = [];
    constructor(extensionPath: string, pageData: Page) {
        this._extensionPath = extensionPath;
        this._buildPath = path.join(this._extensionPath, 'dist');
        this._reactBuildPath = path.join(this._extensionPath, 'dist', 'react-app');
        // Create a new webview panel
        this._pageData = pageData;
        this.panel = vscode.window.createWebviewPanel(CreatePanel.viewType, pageData.title, 0, {
            // Enable javascript in the webview
            enableScripts: true,
            retainContextWhenHidden: true,
            // And restric the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
                // Only allow the webview to access resources in our extension's media directory
                vscode.Uri.file(path.join(this._extensionPath, 'assets')),
                vscode.Uri.file(this._buildPath)
            ]
        });

        // Set the webview's initial html content 
        this.panel.webview.html = this.getHtmlForWebview(pageData.assetsName);

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.onDidChangeViewState((e) => {
            // this._onViewChange();
        });
        // Handle messages from the webview


        // this._onMount();
    }

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this.panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        CommonPanel.delWebView(this._pageData.assetsName);
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

    getHtmlForWebview(pageName: string) {
        try {
            const stylePathOnDisk = vscode.Uri.file(path.join(this._reactBuildPath, 'assets', `${pageName}.css`));
            // const styleUri = stylePathOnDisk.with({ scheme: 'vscode-resource' });
            const styleUri = this.panel.webview.asWebviewUri(stylePathOnDisk);
            const scriptPathOnDisk = vscode.Uri.file(path.join(this._reactBuildPath, 'js', `${pageName}.js`));
            // const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
            const scriptUri = this.panel.webview.asWebviewUri(scriptPathOnDisk);

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
				<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src img-src vscode-resource: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
		
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
            console.log(error);
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


export class CommonPanel {
    static readonly WebviewPanels: WebviewPanelModel = {};
    static generateWebView(CreatePanelFn: any, extensionPath: string, pageData: Page, callback?: Callback) {
        const name = pageData.assetsName || '';
        const WebviewPanels = this.WebviewPanels;
        if (WebviewPanels[name]) {
            WebviewPanels[name].panel.reveal(0);
        } else {
            const WelcomePanel = new CreatePanelFn(extensionPath, pageData);
            WebviewPanels[name] = WelcomePanel;
            callback && callback();
        }
    }
    static getWebView(name: string) {
        return this.WebviewPanels[name] || null;
    }
    static delWebView(name: string) {
        return this.WebviewPanels[name] = null;
    }
}