import * as vscode from 'vscode';
export const createTerminal = (name: string, text: string) => {
    const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
    console.log(terminals);
    const items: vscode.Terminal | undefined = terminals.find(t =>
        t.name === name
    );
    items && items.dispose();
    let terminal = vscode.window.createTerminal(name);
    terminal.show(true);
    terminal.sendText(text);
};