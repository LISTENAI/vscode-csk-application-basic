import * as vscode from 'vscode';
import { join } from 'path';
import { homedir } from 'os';
import { pathExists, readJson } from 'fs-extra';
import { getCommit, clean, getRemote, getTag } from '../../utils/repo';
import { createTerminal } from '../../utils/terminal';

import simpleGit from "simple-git";
import { FileExplorer } from './fileExploer';
export const PLUGIN_HOME = (process.env.LISA_HOME && join(process.env.LISA_HOME, 'lisa-zephyr')) || join(homedir(), '.listenai', 'lisa-zephyr');
const CONFIG_FILE = join(PLUGIN_HOME, 'config.json');
interface IPluginConfig {
    env?: string[];
    sdk?: string;
}
export interface SdkBasic {
    path?: string;
    remote?: string;
    commit?: string;
    version?: string;

}

export class SDK {

    static async load<T>(): Promise<T | null> {
        if (!(await pathExists(CONFIG_FILE))) return null;
        return await readJson(CONFIG_FILE);
    }

    static async get<K extends keyof IPluginConfig>(key: K): Promise<IPluginConfig[K]> {
        const config = await this.load<IPluginConfig>();
        if (config && typeof config.env == 'string') {
            config.env = [config.env]; // 向后兼容
        }
        return config ? config[key] : undefined;
    }

    static async getBasic(): Promise<SdkBasic | null> {
        const sdk = await this.get('sdk');

        if (!sdk) return null;
        if (!(await pathExists(sdk))) return null;
        const tag = await getTag(sdk);
        const git = simpleGit(sdk);
        const commit = await getCommit(git);
        const isClean = await clean(git);
        const commitMsg = `${commit}${isClean ? "" : "*"}`;
        const remoteStr = await getRemote(sdk);
        const remoteArr = /origin\s(.*)\(fetch\)/g.exec(remoteStr) || [];
        return {
            path: sdk,
            remote: remoteArr[1] || '',
            commit: commitMsg,
            version: tag
        };
    }

    static update() {
        createTerminal('SDK', 'lisa zep update');
    }

    static file(context: vscode.ExtensionContext) {
        return new FileExplorer(context);
    }
    static checkout() {
        createTerminal('Checkout  SDK', 'lisa zep sdk');
    }

}
