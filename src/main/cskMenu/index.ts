import * as vscode from 'vscode';
import { soureData, TreeDataModel } from './treeData';
import { SDK } from '../sdk'


export default class NodeProvider implements vscode.TreeDataProvider<vscode.TreeItem>
{
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    data: Array<vscode.TreeItem> = [];
    static data: any;

    refresh(): void {
        return this._onDidChangeTreeData.fire();
    }

    async reloadData() {
        await this.getSDKInfo();
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
        // const data = this.loadData(soureData);
        // console.log('data---', data)
        // this.data = data;
    }


    loadData(treeData: Array<vscode.TreeItem>): any {
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
    async getSDKInfo(): Promise<any> {
        const res = await SDK.getBasic() || {};
        soureData.map(item => {
            if (item.label === 'SDK') {
                item.children.map(child => {
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
         } )
        const data = this.loadData(soureData);
        this.data = data;
        console.log('done', res)
    }

}

export class CskTreeItem extends vscode.TreeItem {
    tooltip: string | undefined
    description: string | undefined
    iconPath?: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri } | vscode.ThemeIcon
    command?: any
    constructor(
        Item: TreeDataModel, public children?: CskTreeItem[]
    ) {
        const { label, tooltip, iconPath, command } = Item
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
        this.tooltip = tooltip;
        if (tooltip) this.description = tooltip;
        if (command && typeof command === 'object' && command?.command) {
            this.command = command
        }
        if (iconPath) this.iconPath = new vscode.ThemeIcon(iconPath);
    }

}