import * as path from 'path';
import * as vscode from 'vscode';
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
            switch (message.command) {
                case 'submit':
                    vscode.window.showErrorMessage(message.data);
                    return;
            }
        }, null, this._disposables);
    }
    
    public static createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        if (ReactPanel.currentPanel) {
            ReactPanel.currentPanel._panel.reveal(column);
        } else {
            ReactPanel.currentPanel = new ReactPanel(extensionPath, column || vscode.ViewColumn.One);
        }
        const treeData = [
            {
              title: 'parent 0',
              key: '0-0',
              children: [
                { title: 'leaf 0-0', key: '0-0-0', isLeaf: true },
                { title: 'leaf 0-1', key: '0-0-1', isLeaf: true },
              ],
            },
            {
              title: 'parent 1',
              key: '0-1',
              children: [
                { title: 'leaf 1-0', key: '0-1-0', isLeaf: true },
                { title: 'leaf 1-1', key: '0-1-1', isLeaf: true },
              ],
            },
          ];
        ReactPanel.currentPanel._panel.webview.postMessage({
            type: 'treeData',
            data: treeData
        });
    }

    public async onView() {
        console.log(123)
        // this.updateWebview();
    }
    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
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