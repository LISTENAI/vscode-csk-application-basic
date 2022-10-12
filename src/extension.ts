// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ReactPanel } from './main/report';
import { sourceData } from './main/cskMenu/treeData';
import { NodeProvider, AppNodeProvider } from './main/cskMenu';
import { Welcome } from './main/welcome';
import { CreateSettingPanel } from './main/application/setting';
import { CreateAppPanel } from './main/application';
import { Application } from './main/application/create';


import { Command } from './main/command';
interface WebviewPanelModel {
	[propName: string ]:any;
}
export const CurrentWebviewPanels: WebviewPanelModel = {};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	let _generating = false;
	let AppSettingPanel: any = null;
	let AppPanel: any = null;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "csk-application-basic" is now active!');
	console.time("csk-application-basic")
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	const WelcomeCskMenuProvider = new NodeProvider(sourceData['welcome']);
	const SdkCskMenuProvider = new NodeProvider(sourceData['sdk']);
	const AppCskMenuProvider = new AppNodeProvider(rootPath);
	await AppCskMenuProvider.init(sourceData['application']);
	await SdkCskMenuProvider.getSDKInfo();
	SdkCskMenuProvider.watch();

	vscode.window.registerTreeDataProvider('csk.menu.Welcome', WelcomeCskMenuProvider);
	vscode.window.registerTreeDataProvider('csk.menu.Sdk', SdkCskMenuProvider);
	vscode.window.registerTreeDataProvider('csk.menu.Application', AppCskMenuProvider);

	vscode.commands.registerCommand('csk.refreshMenu', async () => {
		await SdkCskMenuProvider.refresh();
	});
	console.timeEnd("csk-application-basic")
	vscode.commands.registerCommand('fileExplorer.openFile', (resource) => {
		vscode.window.showTextDocument(resource);
	});
	let welcome = vscode.commands.registerCommand('csk-application-basic.welcome', async () => {
		await Welcome.openHomePage(context);
	});

	let openApplication = vscode.commands.registerCommand('csk-application-basic.open-application', async () => {
		await Welcome.openApplication();
	});
	let createApplication = vscode.commands.registerCommand('csk-application-basic.create-application', async () => {
		if (CurrentWebviewPanels['createApplication']) {
			CurrentWebviewPanels['createApplication'].panel.reveal(0);
		} else {
			AppPanel = new CreateAppPanel(context.extensionPath, { title: '新建应用', assetsName: 'createApplication' });
			CurrentWebviewPanels['createApplication'] = AppPanel;
		}
	});
	
	let CreateAppSetting = vscode.commands.registerCommand('csk-application-basic.create-application-setting', async () => {
		if (CurrentWebviewPanels['applicationSetting']) {
			CurrentWebviewPanels['applicationSetting'].panel.reveal(0);
		} else {
			AppSettingPanel = new CreateSettingPanel(context.extensionPath, { title: '应用配置', assetsName: 'applicationSetting' });
			CurrentWebviewPanels['applicationSetting'] = AppSettingPanel
		}
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

	});
	let appBuild = vscode.commands.registerCommand('csk-application-basic.app-build', async () => {
		await Application.buildApp(rootPath)
	});
	let appFlash = vscode.commands.registerCommand('csk-application-basic.app-flash', async () => {
		await Command.run('app', `lisa zep flash`);
	});


	let report = vscode.commands.registerCommand('csk-application-basic.memory-report', async () => {
		if (_generating) {
			return;
		}
		_generating = true;
		await ReactPanel.createOrShow(context.extensionPath);
		_generating = false;
	});


	context.subscriptions.push(welcome);
	context.subscriptions.push(openApplication);
	context.subscriptions.push(createApplication);
	context.subscriptions.push(CreateAppSetting);
	context.subscriptions.push(openDocument);
	context.subscriptions.push(getZepInfo);
	context.subscriptions.push(report);
	context.subscriptions.push(updateSdk);
	context.subscriptions.push(appBuild);
	context.subscriptions.push(appFlash);
	context.subscriptions.push(changeSdkVersion);



}

// this method is called when your extension is deactivated
export function deactivate() {

}
