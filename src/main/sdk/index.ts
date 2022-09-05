import * as vscode from 'vscode';
import { cmd } from '../cmd'
export class SDK {
    static async getBasicInfo() {
        const res = await (cmd('lisa info zep'))
        console.log(res)
    }
}
