import * as vscode from 'vscode';

export interface TreeDataModel {
    label: string;
    tooltip?: string;
    iconPath?: string;
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
                    command: 'csk-application-basic.welcome',
                    title: ''
                },
                iconPath: 'home',
            },
            {
                label: '打开应用项目',
                tooltip: '',
                command: {
                    arguments: [],
                    command: 'csk-application-basic.open-application',
                    title: ''
                },
                iconPath: 'add',
            },
            {
                label: '创建应用项目',
                tooltip: '',
                command: {
                    arguments: [],
                    command: 'csk-application-basic.create-application',
                    title: ''
                },
                iconPath: 'wand',
            },
            {
                label: '查看开发文档',
                tooltip: '',
                command: {
                    arguments: [],
                    command: 'csk-application-basic.open-document',
                    title: ''
                },
                iconPath: 'globe',
            },
            {
                label: '本机开发信息',
                tooltip: '',
                command: {
                    arguments: [],
                    command: 'csk-application-basic.info',
                    title: ''
                },
                iconPath: 'gear'
            }
        ]
    },
    {
        label: 'SDK',
        tooltip: '',
        children: [
            {
                label: '基本信息',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: '',
                children: [
                    {
                        label: '本机路径：',
                        tooltip: 'xxxxxx',
                        command: {
                            arguments: [],
                            command: 'csk-application-basic.welcome',
                            title: ''
                        },
                        iconPath: '',
                    },
                    {
                        label: 'git remote：',
                        tooltip: '',
                        command: {
                            arguments: [],
                            command: 'csk-application-basic.open-application',
                            title: ''
                        },
                        iconPath: '',
                    },
                    {
                        label: '版本：',
                        tooltip: '',
                        command: {
                            arguments: [],
                            command: 'csk-application-basic.welcome',
                            title: ''
                        },
                        iconPath: '',
                    },
                    {
                        label: 'commit：',
                        tooltip: '',
                        command: {
                            arguments: [],
                            command: 'csk-application-basic.welcome',
                            title: ''
                        },
                        iconPath: '',
                    }
                ]
            },
            {
                label: 'action',
                tooltip: '',
                iconPath: '',
                children: [
                    {
                        label: 'update',
                        tooltip: 'update sdk',
                        command: {
                            arguments: [],
                            command: '',
                            title: ''
                        },
                        iconPath: 'arrow-up',
                    }
                ]
            },
            {
                label: 'manifest dependencies',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: '',

                },
                iconPath: '',
                children: [
                    {
                        label: 'add',
                        tooltip: 'add manifest dependencies',
                        command: {
                            arguments: [],
                            command: '',
                            title: ''
                        },
                        iconPath: 'add',
                    },
                    {
                        label: 'remove',
                        tooltip: 'remove manifest dependencies',
                        command: {
                            arguments: [],
                            command: '',
                            title: ''
                        },
                        iconPath: 'trash',
                    }
                ]
            },
            {
                label: 'source code',
                tooltip: '',
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: ''
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
                iconPath: 'settings-gear',
            },
            {
                label: '产物',
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
]

