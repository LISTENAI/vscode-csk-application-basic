// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ReactPanel } from './main/report'

import NodeProvider from './main/cskMenu';
import { Welcome } from './main/welcome';
import { CreatePanel } from './main/application';
import { Application } from './main/application/create';

import { SDK } from './main/sdk';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	let _generating = false;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	const start = Date.now();
	console.log('Congratulations, your extension "csk-application-basic" is now active!');

	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	const CskMenuProvider = new NodeProvider();
	await CskMenuProvider.getSDKInfo();
	CskMenuProvider.watch();

	vscode.window.registerTreeDataProvider('csk.menu', CskMenuProvider);
	vscode.commands.registerCommand('csk.refreshMenu', async () => {
		await CskMenuProvider.refresh();
	});
	console.log('csk menu done', (Date.now() - start) / 1000 + 's');
	vscode.commands.registerCommand('fileExplorer.openFile', (resource) => CskMenuProvider.openResource(resource));

	let welcome = vscode.commands.registerCommand('csk-application-basic.welcome', async () => {
		await Welcome.openHomePage(context);
	});

	let openApplication = vscode.commands.registerCommand('csk-application-basic.open-application', async() => {
		await Welcome.openApplication();
	})
	let createApplication = vscode.commands.registerCommand('csk-application-basic.create-application', async () => {
		await CreatePanel.createOrShow(context.extensionPath);
	})
	let buildApplication = vscode.commands.registerCommand('csk-application-basic.build-application', async () => {
		 Application.build();
	})
	let flashApplication = vscode.commands.registerCommand('csk-application-basic.flash-application', async () => {
		Application.flash();
	})
	let getZepInfo = vscode.commands.registerCommand('csk-application-basic.info', async () => {
		await Welcome.getZepInfo();
	})
	let openDocument = vscode.commands.registerCommand('csk-application-basic.open-document', () => {
		 Welcome.openDocument('https://docs.listenai.com/chips/600X/application/getting_start')
	})
	let updateSdk = vscode.commands.registerCommand('csk-application-basic.update-sdk', async () => {
		await SDK.update();
	})
	let checkoutSdk = vscode.commands.registerCommand('csk-application-basic.checkout-sdk', async () => {
		await SDK.checkout();
	})
	
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
	context.subscriptions.push(buildApplication);
	context.subscriptions.push(flashApplication);
	context.subscriptions.push(openDocument);
	context.subscriptions.push(getZepInfo);
	context.subscriptions.push(report);
	context.subscriptions.push(updateSdk);
	context.subscriptions.push(checkoutSdk);
	

}

// this method is called when your extension is deactivated
export function deactivate() {
	
 }
