import * as vscode from 'vscode';
export default class Tools {
    //打开csk串口terminal
    static async openCskTerminal() {
        try {
            //如果已经安装插件但是被禁用也是会返回undefined
            const hasCskTerminal: any = vscode.extensions.getExtension('listenai.csk-terminal');
            if (hasCskTerminal) {
                await vscode.commands.executeCommand('workbench.view.extension.csk-terminal');
            } else {
                //跳转到以安装的插件列表。后续看是否有api在列表中进行搜索
                vscode.window.showWarningMessage('请确认是否已安装并启用csk串口terminal', {}, ...["去确认"]).then(async () => {
                    await vscode.commands.executeCommand('workbench.extensions.action.showInstalledExtensions', 'csk terminal');
                });
            }
        } catch (error) {
            console.error(error);
        }

    }
}