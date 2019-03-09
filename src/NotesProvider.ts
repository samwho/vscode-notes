import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { O_CREAT } from 'constants';

export class NotesProvider implements vscode.TreeDataProvider<Note> {

	private _onDidChangeTreeData: vscode.EventEmitter<Note | undefined> = new vscode.EventEmitter<Note | undefined>();
	readonly onDidChangeTreeData: vscode.Event<Note | undefined> = this._onDidChangeTreeData.event;

	constructor(private root: string) {
		if (!fs.existsSync(root)) {
			fs.mkdirSync(root);
		}
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	new(relpath: string): Note {
		let fullpath = path.join(this.root, relpath);

		let dir = path.dirname(fullpath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			console.log("created dir: " + dir);
		}

		if (!fs.existsSync(fullpath)) {
			let fd = fs.openSync(fullpath, O_CREAT);
			fs.closeSync(fd);
			console.log("created file: " + fullpath);
		}

		return new Note(fullpath, vscode.TreeItemCollapsibleState.Expanded);
	}

	getTreeItem(element: Note): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Note): Thenable<Note[]> {
		let p = element ? element.fullPath : this.root;
		return this.notesFromPath(p);
	}

	notesFromPath(p: string): Thenable<Note[]> {
		let stat = fs.statSync(p);
		if (!stat.isDirectory()) {
			return Promise.resolve([]);
		}

		return Promise.resolve(fs.readdirSync(p).map(f => {
			let fp = path.join(p, f);
			let stat = fs.statSync(fp);
			let collapsibleState = stat.isDirectory() ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None;
			return new Note(fp, collapsibleState);
		}));
	}
}

export class Note extends vscode.TreeItem {
	constructor(
		public readonly fullPath: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(path.basename(fullPath), collapsibleState);
		this.command = {
			"command": "vscode-note.open",
			"arguments": [fullPath],
			"title": "Open Note"
		};
	}
}
