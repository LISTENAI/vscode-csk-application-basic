import * as vscode from 'vscode';

export interface TreeDataModel {
    label: string;
    tooltip?: string;
    iconPath?: { light: string; dark: string };
    description?: string;
    children?: Array<TreeDataModel>;
    command?: vscode.Command;
}
export const soureData = [
    {
        label: 'WELCOME',
        tooltip: '',
        children: [
            {
                label: 'Home Page',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: {},
            },
            {
                label: '打开应用项目',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: {},
            },
            {
                label: '创建应用项目',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: {},
            },
            {
                label: '本机开发信息',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: {}
            }
        ]
    },
    {
        label: 'SDK',
        tooltip: '',
        children: [
            {
                label: 'basic info',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: {},
            },
            {
                label: 'action',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: {},
            },
            {
                label: 'manifest dependencies',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: {},
            },
            {
                label: 'source code',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: {}
            }
        ]
    },
    {
        label: 'APPLICATION',
        tooltip: '',
        children: [
            {
                label: '编译配置',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: {},
            },
            {
                label: '产物',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: {},
            }
        ]
    }
]

