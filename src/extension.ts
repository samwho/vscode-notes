'use strict';

import * as vscode from 'vscode';

import { NotesProvider } from './NotesProvider';

export function activate(context: vscode.ExtensionContext) {
	function command(name: string, cb: (...args: any[]) => void): void {
		context.subscriptions.push(vscode.commands.registerCommand(name, cb));
	}

	const globalNotesProvider = new NotesProvider(context.globalStoragePath);
	vscode.window.registerTreeDataProvider('globalNotes', globalNotesProvider);

	vscode.window.createTreeView("globalNotes", {
		treeDataProvider: globalNotesProvider
	});

	command("vscode-notes.new", async (ctx) => {
		globalNotesProvider.new("test.md");
		globalNotesProvider.refresh();
	});

	command("vscode-notes.refresh", async (ctx) => {
		globalNotesProvider.refresh();
	});

	command("vscode-notes.rename", async (ctx) => {
	});

	command("vscode-notes.open", async (fullpath) => {
		if (!fullpath) { return; }

		let document;

		try {
			document = await vscode.workspace.openTextDocument(fullpath);
		} catch (err) {
			vscode.window.showErrorMessage(err.message);
		}

		if (document) {
			vscode.window.showTextDocument(document);
		}
	});
}