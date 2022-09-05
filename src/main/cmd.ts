import * as vscode from 'vscode';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
export async function cmd(command: string) {
    const cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath;
    const env = process.env;
    const res = await exec(command, {
        shell: process.platform === 'darwin' ? undefined : 'powershell',
        cwd,
        env,
        encoding: 'utf8',
    });
    console.log(res);
    const { stdout, stderr } = res;
    return {
        success: !stderr,
        stdout: stdout
    };
}