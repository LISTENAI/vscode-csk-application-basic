import * as vscode from 'vscode';

export interface TreeDataModel {
    label?: string;
    tooltip?: string;
    isFile?: boolean;
    iconPath?: string;
    description?: string;
    children?: Array<TreeDataModel>;
    command?: vscode.Command;
    uri?: vscode.Uri,
    type?:any
}
export const sourceData = [
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
                children:[]
            },
            {
                label: '操作',
                tooltip: '',
                iconPath: '',
                children: [
                    {
                        label: '更新module依赖',
                        command: {
                            arguments: [],
                            command: 'csk-application-basic.sdk-update-manifest',
                            title: ''
                        },
                        // iconPath: 'arrow-up',
                    },
                    {
                        label: '版本切换',
                        command: {
                            arguments: [],
                            command: 'csk-application-basic.sdk-change-version',
                            title: ''
                        },
                        // iconPath: 'arrow-up',
                    }
                ]
            },
            // {
            //     label: 'manifest dependencies',
            //     tooltip: '',
            //     command: {
            //         arguments: [],
            //         command: '',
            //         title: '',

            //     },
            //     iconPath: '',
            //     children: [
            //         {
            //             label: 'add',
            //             tooltip: 'add manifest dependencies',
            //             command: {
            //                 arguments: [],
            //                 command: '',
            //                 title: ''
            //             },
            //             iconPath: 'add',
            //         },
            //         {
            //             label: 'remove',
            //             tooltip: 'remove manifest dependencies',
            //             command: {
            //                 arguments: [],
            //                 command: '',
            //                 title: ''
            //             },
            //             iconPath: 'trash',
            //         }
            //     ]
            // },
            {
                label: 'SDK源码',
                tooltip: '',
                isFile:true,
                command: {
                    arguments: [],
                    command: '',
                    title: ''
                },
                iconPath: '',
                children: [
                    {
                        label: 'test',
                        tooltip: '',
                        command: {
                            arguments: [],
                            command: '',
                            title: ''
                        },
                        iconPath: 'settings-gear',
                    },
                ]
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
                label: '编译',
                tooltip: '',
                command: {
                    arguments: [],
                    command: 'csk-application-basic.app-build',
                    title: ''
                },
                iconPath: 'rocket'
            },
            {
                label: '烧录',
                tooltip: '',
                command: {
                    arguments: [],
                    command: 'csk-application-basic.app-flash',
                    title: ''
                },
                iconPath: 'symbol-event',
            }
        ]
    }
]

