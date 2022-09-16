import * as vscode from 'vscode';
import { WelcomePanel } from './openHome'
export class Welcome {
    // 打开Home page
    public static async openHomePage(context: vscode.ExtensionContext) {
        await WelcomePanel.createOrShow(context.extensionPath);
    }
    // 打开应用项目
    public static async openApplication() {
        await vscode.commands.executeCommand('vscode.openFolder')
    }
    //创建应用项目
    public static async createApplication() {
        const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
        console.log(terminals)
        const items: vscode.Terminal | undefined = terminals.find(t =>
            t.name === 'lisa Terminal'
        );
        let terminal = items ? items : vscode.window.createTerminal(`lisa Terminal`);
        terminal.show(true);
        terminal.sendText('lisa zep sdk create')

    }
    // 查看开发文档
    public static openDocument(url: string) {
        vscode.env.openExternal(vscode.Uri.parse(url));
    }
    // 本机开发信息
    public static async getZepInfo() {
        const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
        console.log(terminals)
        const items: vscode.Terminal | undefined = terminals.find(t =>
            t.name === 'lisa Terminal'
        );
        items && items.dispose()
        let terminal = vscode.window.createTerminal(`lisa Terminal`);
        terminal.show(true);
        terminal.sendText('lisa info zep')

    }
}
