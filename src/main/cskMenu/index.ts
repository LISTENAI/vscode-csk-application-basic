import * as vscode from 'vscode';
import { soureData, TreeDataModel } from './treeData';
import { SDK } from '../sdk'
import { FileStat } from '../sdk/fileExploer'
import * as path from 'path';
import * as fs from 'fs';
import { Throttle } from '../../utils/throttle'

namespace _ {

    function handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null | undefined, result: T): void {
        if (error) {
            reject(massageError(error));
        } else {
            resolve(result);
        }
    }

    function massageError(error: Error & { code?: string }): Error {
        if (error.code === 'ENOENT') {
            return vscode.FileSystemError.FileNotFound();
        }

        if (error.code === 'EISDIR') {
            return vscode.FileSystemError.FileIsADirectory();
        }

        if (error.code === 'EEXIST') {
            return vscode.FileSystemError.FileExists();
        }

        if (error.code === 'EPERM' || error.code === 'EACCESS') {
            return vscode.FileSystemError.NoPermissions();
        }

        return error;
    }

    export function checkCancellation(token: vscode.CancellationToken): void {
        if (token.isCancellationRequested) {
            throw new Error('Operation cancelled');
        }
    }

    export function normalizeNFC(items: string): string;
    export function normalizeNFC(items: string[]): string[];
    export function normalizeNFC(items: string | string[]): string | string[] {
        if (process.platform !== 'darwin') {
            return items;
        }

        if (Array.isArray(items)) {
            return items.map(item => item.normalize('NFC'));
        }

        return items.normalize('NFC');
    }

    export function readdir(path: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(path, (error, children) => handleResult(resolve, reject, error, normalizeNFC(children)));
        });
    }

    export function stat(path: string): Promise<fs.Stats> {
        return new Promise<fs.Stats>((resolve, reject) => {
            fs.stat(path, (error, stat) => handleResult(resolve, reject, error, stat));
        });
    }

    export function readfile(path: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(path, (error, buffer) => handleResult(resolve, reject, error, buffer));
        });
    }

    export function writefile(path: string, content: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(path, content, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function exists(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(path, exists => handleResult(resolve, reject, null, exists));
        });
    }

    export function rmrf(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // rimraf(path, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function mkdir(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // mkdirp(path, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function rename(oldPath: string, newPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.rename(oldPath, newPath, error => handleResult(resolve, reject, error, void 0));
        });
    }

    export function unlink(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.unlink(path, error => handleResult(resolve, reject, error, void 0));
        });
    }

}
let throttle = new Throttle()
export default class NodeProvider implements vscode.TreeDataProvider<vscode.TreeItem>
{
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    data: Array<vscode.TreeItem> = [];
    static data: any;
    private _sdkPath!: string;
    async refresh(): Promise<void> {
        await this.reloadData();
    }
    reloadData = async () => {
        console.log('refresh menu')
        await this.getSDKInfo();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        if (element.type === vscode.FileType.File) {
            element.command = { command: 'fileExplorer.openFile', title: "Open File", arguments: [element.uri], };
            element.contextValue = 'file';
        }
        return element;
    }
    async getChildren(element?: any): Promise<vscode.ProviderResult<any>> {
        if (element === undefined) {
            return this.data;
        }
        if (element && element.isFile) {
            element.children = await this.getFileChildren()
            return element.children;
        }
        if (element && element.type === 2) {
            element.children = await this.getFileChildren(element)
            return element.children;
        }

        return element.children;
    }
    async getFileChildren(element?: any) {
        if (element) {
            const children = await this.readDirectory(element.uri);
            return children.map(([name, type]) => (new CskTreeItem({ uri: vscode.Uri.file(path.join(element.uri.fsPath, name)), type })));
        }
        // const entryFolder = element.entry
        console.log('_sdkPath', this._sdkPath)
        const entryFolder = this._sdkPath && vscode.Uri.parse(this._sdkPath)
        if (entryFolder) {
            const children = await this.readDirectory(entryFolder);
            children.sort((a, b) => {
                if (a[1] === b[1]) {
                    return a[0].localeCompare(b[0]);
                }
                return a[1] === vscode.FileType.Directory ? -1 : 1;
            });
            const arr = children.map(([name, type]) => (new CskTreeItem({ uri: vscode.Uri.file(path.join(entryFolder.fsPath, name)), type })));
            return arr;
        }

        return [];
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
        return this._readDirectory(uri);
    }
    async _readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
        const children = await _.readdir(uri.fsPath);

        const result: [string, vscode.FileType][] = [];
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const stat = await this._stat(path.join(uri.fsPath, child));
            result.push([child, stat.type]);
        }

        return Promise.resolve(result);
    }
    stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
        return this._stat(uri.fsPath);
    }

    async _stat(path: string): Promise<vscode.FileStat> {
        return new FileStat(await _.stat(path));
    }

    watch(): vscode.Disposable {
        const uri = vscode.Uri.parse(this._sdkPath)
        throttle.open()
        let throttleUse: Function = throttle.use(this.reloadData, 2000, true)
        const watcher = fs.watch(uri.fsPath, { recursive: true }, async (event: string, filename: string | Buffer) => {
            if (filename && filename.indexOf('.git') < 0) {
                throttleUse()
            }
        });
        return { dispose: () => watcher.close() };
    }

    constructor() {

    }
    loadData = (treeData: Array<vscode.TreeItem>): any => {
        const mData: Array<vscode.TreeItem> = [];
        treeData.forEach((model: any) => {
            const childLength = model.children?.length ? model.children?.length : 0;
            if (childLength > 0) {
                const mChildData: Array<any> = [];
                model.children!.forEach((childModel: any) => {
                    const childModelLength = childModel.children?.length ? childModel.children?.length : 0;
                    var childDataItem = new CskTreeItem(childModel);
                    if (childModelLength > 0) {
                        const childData = this.loadData(childModel.children);
                        const subChiCldDataItem = new CskTreeItem(childModel, childData)
                        mChildData.push(subChiCldDataItem);
                    } else {
                        mChildData.push(childDataItem);
                    }

                });
                const childDataItem = new CskTreeItem(model, mChildData);
                mData.push(childDataItem)
            } else {
                mData.push(new CskTreeItem(model));
            }
        });
        return mData
    }
    getSDKInfo = async (): Promise<any> => {
        const res = await SDK.getBasic() || {};
        this._sdkPath = res.path || '';
        soureData.map(item => {
            if (item.label === 'SDK') {
                item.children.map((child: TreeDataModel) => {
                    if (child.label === '基本信息') {
                        child.children = [
                            {
                                label: `本机路径：(${res.path || ''})`,
                                tooltip: '',
                                command: {
                                    arguments: [],
                                    command: '',
                                    title: ''
                                },
                                iconPath: '',
                            },
                            {
                                label: `git remote：(${res.remote || ''})`,
                                tooltip: '',
                                command: {
                                    arguments: [],
                                    command: '',
                                    title: ''
                                },
                                iconPath: '',
                            },
                            {
                                label: `版本：(${res.version || ''})`,
                                tooltip: '',
                                command: {
                                    arguments: [],
                                    command: '',
                                    title: ''
                                },
                                iconPath: '',
                            },
                            {
                                label: `commit：(${res.commit || ''})`,
                                tooltip: '',
                                command: {
                                    arguments: [],
                                    command: '',
                                    title: ''
                                },
                                iconPath: '',
                            }
                        ]
                    }
                    return child
                })
            }
            return item
        })
        const data = this.loadData(soureData);
        this.data = data;
        console.log('menu data', data);
    }
    openResource(resource: vscode.Uri): void {
        vscode.window.showTextDocument(resource);
    }
}


export class CskTreeItem extends vscode.TreeItem {
    tooltip: string | undefined
    description: string | undefined
    iconPath?: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri } | vscode.ThemeIcon
    command?: vscode.Command
    isFile?: boolean
    type?: number
    uri?: vscode.Uri
    contextValue?: any
    constructor(
        Item: TreeDataModel, public children?: CskTreeItem[]
    ) {

        const { label, tooltip, iconPath, command, isFile, type, uri } = Item
        const isCollapsed = type !== undefined ? (type === vscode.FileType.Directory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None) : (children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
        const labelV: any = label || uri
        super(labelV, isCollapsed);
        this.tooltip = tooltip;
        this.isFile = isFile;
        this.type = type;
        this.uri = uri;
        if (tooltip) this.description = tooltip;
        if (command && typeof command === 'object' && command?.command) {
            this.command = command
        }
        if (iconPath) this.iconPath = new vscode.ThemeIcon(iconPath);
        if (type === vscode.FileType.File) {
            this.command = { command: 'fileExplorer.openFile', title: "Open File", arguments: [uri], };
            this.contextValue = 'file';
        }
    }

}