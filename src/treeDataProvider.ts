import * as vscode from "vscode";

export class TreeDataProvider implements vscode.TreeDataProvider<BoardItem> {
  constructor(private boardsUri: vscode.Uri) {}

  private _onDidChangeTreeData: vscode.EventEmitter<
    BoardItem | undefined | null | void
  > = new vscode.EventEmitter<BoardItem | undefined | null | void>();

  onDidChangeTreeData?:
    | vscode.Event<void | BoardItem | BoardItem[] | null | undefined>
    | undefined = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: BoardItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: BoardItem | undefined
  ): vscode.ProviderResult<BoardItem[]> {
    return vscode.workspace.fs
      .readDirectory(this.boardsUri)
      .then((files) =>
        files.filter(
          (file) =>
            file[1] === vscode.FileType.File && file[0].endsWith(".json")
        )
      )
      .then((files) => {
        if (files.length === 0) {
          vscode.commands.executeCommand(
            "setContext",
            "vscode-kanban.noBoards",
            true
          );
        } else {
          vscode.commands.executeCommand(
            "setContext",
            "vscode-kanban.noBoards",
            false
          );
        }

        return files;
      })
      .then((files) =>
        files.map(
          (file) =>
            new BoardItem({
              uri: vscode.Uri.joinPath(this.boardsUri, file[0]),
              label: file[0].replace(".json", ""),
            })
        )
      );
  }
}

class BoardItem extends vscode.TreeItem {
  contextValue?: string | undefined = "kanban-board";
  constructor({ uri, label }: { uri: vscode.Uri; label: string }) {
    super(label);
    this.resourceUri = uri;
    this.tooltip = uri.path;
    this.command = {
      command: "vscode.openWith",
      title: "Open Board",
      arguments: [uri],
    };
  }
}

export function deleteBoardItem(item: BoardItem) {
  if (item.resourceUri) {
    vscode.workspace.fs.delete(item.resourceUri);
  }
}
