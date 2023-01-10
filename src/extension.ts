// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CreateReportPanel } from './main/report';
import { SourceData } from './main/cskMenu/treeData';
import { NodeProvider, AppNodeProvider } from './main/cskMenu';
import { Welcome } from './main/welcome';
import { CreateWelcomePanel } from './main/welcome/openHome';
import { CreateSettingPanel } from './main/application/setting';
import { CreateAppPanel } from './main/application';
import { Application } from './main/application/create';
import Tools from './main/tools';

import { CommonPanel } from '@/utils/panel';
import { Command } from './main/command';
import {
	execa
} from 'execa';
// import { platform } from 'os';
// const iconv = require('iconv-lite');

interface WebviewPanelModel {
	[propName: string]: any;
}
export const CurrentWebviewPanels: WebviewPanelModel = {};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	let _generating = false;
	console.time('检查开发环境');
	const res = await checkExtension();
	console.timeEnd('检查开发环境');

	if (!res) return;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.time("csk-application-basic");
	console.log('Congratulations, your extension "csk-application-basic" is now active!');
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	const WelcomeCskMenuProvider = new NodeProvider('welcome');
	const SdkCskMenuProvider = new NodeProvider('sdk');
	const ToolsCskMenuProvider = new NodeProvider('tools');
	const AppCskMenuProvider = new AppNodeProvider(rootPath, 'application');
	await AppCskMenuProvider.init();
	await SdkCskMenuProvider.getSDKInfo();
	SdkCskMenuProvider.watch();

	vscode.window.registerTreeDataProvider('csk.menu.Welcome', WelcomeCskMenuProvider);
	vscode.window.registerTreeDataProvider('csk.menu.Sdk', SdkCskMenuProvider);
	vscode.window.registerTreeDataProvider('csk.menu.Application', AppCskMenuProvider);
	vscode.window.registerTreeDataProvider('csk.menu.Tools', ToolsCskMenuProvider);


	vscode.commands.registerCommand('csk.refreshMenu', async () => {
		await SdkCskMenuProvider.refresh();
	});
	console.timeEnd("csk-application-basic");
	vscode.commands.registerCommand('fileExplorer.openFile', (resource) => {
		vscode.window.showTextDocument(resource);
	});
	let welcome = vscode.commands.registerCommand('csk-application-basic.welcome', async () => {
		CommonPanel.generateWebView(CreateWelcomePanel, context.extensionPath, { title: 'WelCome to CSK', assetsName: 'welcome' });
	});

	let openApplication = vscode.commands.registerCommand('csk-application-basic.open-application', async () => {
		await Welcome.openApplication();
	});
	let createApplication = vscode.commands.registerCommand('csk-application-basic.create-application', async () => {
		CommonPanel.generateWebView(CreateAppPanel, context.extensionPath, { title: '新建应用', assetsName: 'createApplication' });
	});

	let CreateAppSetting = vscode.commands.registerCommand('csk-application-basic.create-application-setting', async () => {
		CommonPanel.generateWebView(CreateSettingPanel, context.extensionPath, { title: '应用配置', assetsName: 'applicationSetting' });
	});

	let getZepInfo = vscode.commands.registerCommand('csk-application-basic.info', async () => {
		await Welcome.getZepInfo();
	});
	let openDocument = vscode.commands.registerCommand('csk-application-basic.open-document', () => {
		Welcome.openDocument('https://docs.listenai.com/chips/600X/application/getting_start');
	});
	let updateSdk = vscode.commands.registerCommand('csk-application-basic.sdk-update-manifest', async () => {
		await Command.run('sdk', `lisa zep update`);
	});
	let changeSdkVersion = vscode.commands.registerCommand('csk-application-basic.sdk-change-version', async () => {
		await Command.run('sdk', `lisa zep sdk use`);
		setTimeout(async () => {
			await SdkCskMenuProvider.refresh();
		}, 5000);
	});
	let appBuild = vscode.commands.registerCommand('csk-application-basic.app-build', async () => {
		await Application.buildApp(rootPath);
	});
	let appFlash = vscode.commands.registerCommand('csk-application-basic.app-flash', async () => {
		await Command.run('app', `lisa zep flash`);
	});

	let report = vscode.commands.registerCommand('csk-application-basic.memory-report', async () => {
		if (_generating) {
			return;
		}
		_generating = true;
		CommonPanel.generateWebView(CreateReportPanel, context.extensionPath, { title: 'Memory Report', assetsName: 'report' }, getReportData);
		_generating = false;
	});
	let cskViewFinderSpd = vscode.commands.registerCommand('csk-application-basic.finder-spd', async () => {
		Welcome.openDocument('https://tool.listenai.com/csk-view-finder-spd/');
	});
	let cskTerminal = vscode.commands.registerCommand('csk-application-basic.csk-terminal', async () => {
		await Tools.openCskTerminal();
	});

	const subscriptionsArr = [
		welcome,
		openApplication,
		createApplication,
		CreateAppSetting,
		openDocument,
		getZepInfo,
		report,
		updateSdk,
		appBuild,
		appFlash,
		changeSdkVersion,
		cskViewFinderSpd,
		cskTerminal
	];
	subscriptionsArr.forEach(sub => {
		context.subscriptions.push(sub);
	});

}

// this method is called when your extension is deactivated
export function deactivate() {

}
async function getReportData() {
	const ReportPanel = CommonPanel.getWebView('report');
	ReportPanel && await ReportPanel.sendData();
}

async function checkExtension() {
	// const encoding = platform() == 'win32' ? 'cp936' : 'utf-8';
	try {
		await execa('lisa', ['info', 'zep']);
		return true;
	} catch (e: any) {
		vscode.window.showErrorMessage(e.message || '');
		return false;
	}
}