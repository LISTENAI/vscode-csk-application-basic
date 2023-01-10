import * as vscode from 'vscode';
import { CreatePanel, Page } from '@/utils/panel';
/**
 * Welcome 
 * Home Page
 */
export class CreateWelcomePanel extends CreatePanel {

    constructor(extensionPath: string, pageData: Page) {
        super(extensionPath, pageData);
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(async message => {
            console.log(message);
            switch (message.type) {
                case 'executeCommand':
                    message.data && vscode.commands.executeCommand(message.data);
                    return;
                default:
                    return;

            }
        }, null, this.disposables);

    }
}