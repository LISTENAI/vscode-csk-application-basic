import * as vscode from 'vscode';
import { soureData, TreeDataModel } from './treeData';
import * as path from 'path';

export default class NodeProvider implements vscode.TreeDataProvider<vscode.TreeItem>
{
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    data: vscode.TreeItem[] | undefined;

    refresh(): void {
        return this._onDidChangeTreeData.fire();
    }

    reloadData(): void {
        this.loadData();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: any): vscode.ProviderResult<any[]> {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }



    constructor() {
        this.loadData()
    }

    loadData(): void {
        var treeData: Array<vscode.TreeItem> = soureData;
        var mData: Array<vscode.TreeItem> = [];
        treeData.forEach((model: any) => {
            const childLength = model.children?.length ? model.children?.length : 0;
            if (childLength > 0) {
                var mChildData: Array<any> = [];
                model.children!.forEach((childModel: any) => {
                    const childDataItem: any = new CskTreeItem(childModel);
                    mChildData.push(childDataItem);
                });
                const childDataItem: any = new CskTreeItem(model, mChildData);
                mData.push(childDataItem)
            } else {
                mData.push(new CskTreeItem(model));
            }
        });
        console.log('mData')
        console.log(mData)
        this.data = mData;
    }
}

export class CskTreeItem extends vscode.TreeItem {

    constructor(
        Item: TreeDataModel, public children?: CskTreeItem[]
    ) {
        const { label, tooltip, iconPath, command } = Item
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
        this.tooltip = tooltip;
        this.description = tooltip;
        iconPath && this.getIconPath(iconPath);
        if(command) this.command = command;

    }
    private getIconPath(iconPath: { light: string; dark: string }) {
        this.iconPath = {
            light: path.join(__dirname, '..', '..', 'assets', 'light', iconPath.light),
            dark: path.join(__dirname, '..', '..', 'assets', 'dark', iconPath.dark)
        }
    }

}