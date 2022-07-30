import * as vscode from "vscode";
import { deleteBoardItem, TreeDataProvider } from "./treeDataProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("im alive");

  if (vscode.workspace.workspaceFolders === undefined) {
    return;
  }

  const boardsPath = vscode.Uri.joinPath(
    vscode.workspace.workspaceFolders[0].uri,
    ".vscode",
    "kanban"
  );

  const treeDataProvider = new TreeDataProvider(boardsPath);

  vscode.window.registerTreeDataProvider(
    "vscode-kanban.activityView",
    treeDataProvider
  );

  const disposableRefreshBoards = vscode.commands.registerCommand(
    "vscode-kanban.refreshBoards",
    () => {
      treeDataProvider.refresh();
    }
  );

  const disposableDeleteBoard = vscode.commands.registerCommand(
    "vscode-kanban.deleteBoard",
    deleteBoardItem
  );

  function checkBoards() {
    treeDataProvider.refresh();
  }

  const disposableCreate = vscode.workspace
    .createFileSystemWatcher(vscode.Uri.joinPath(boardsPath, "*.json").path)
    .onDidCreate(checkBoards);

  const disposableDelete = vscode.workspace
    .createFileSystemWatcher(vscode.Uri.joinPath(boardsPath, "*.json").path)
    .onDidDelete(checkBoards);

  const disposableChange = vscode.workspace
    .createFileSystemWatcher(vscode.Uri.joinPath(boardsPath, "*.json").path)
    .onDidChange(checkBoards);

  context.subscriptions.push(
    disposableCreate,
    disposableDelete,
    disposableChange,
    disposableRefreshBoards,
    disposableDeleteBoard
  );
}

export function deactivate() {}
