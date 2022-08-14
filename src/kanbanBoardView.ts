import * as vscode from "vscode";
import { KanbanBoard } from ".";
import { createParentMessageHandler } from "./parentMessageHandler";
import { getNonce } from "./utils";

export class KanbanBoardView implements vscode.CustomTextEditorProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel
  ): Promise<void> {
    const messageListener = createParentMessageHandler({
      saveBoard(payload) {
        updateTextDocument(document, payload);
        console.log("updated document: ", JSON.stringify(payload));
      },
    });

    const disposableOnChangeDocument = vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (event.document.uri.toString() === document.uri.toString()) {
          vscode.window.showInformationMessage(document.uri.toString());
        }
      }
    );

    panel.onDidDispose(() => {
      disposableOnChangeDocument.dispose();
    });

    this.configureWebview({
      messageListener,
      panel,
    });
  }

  private configureWebview({
    panel,
    messageListener,
  }: {
    panel: vscode.WebviewPanel;
    messageListener: ReturnType<typeof createParentMessageHandler>;
  }): void {
    panel.webview.options = {
      enableScripts: true,
    };
    panel.webview.onDidReceiveMessage(messageListener);

    panel.webview.html = this.getHtmlForWebview(panel.webview);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    // Local path to script and css for the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "assets",
        "script",
        "index.js"
      )
    );

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "assets",
        "css",
        "reset.css"
      )
    );

    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "assets",
        "css",
        "vscode.css"
      )
    );

    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "assets",
        "css",
        "index.css"
      )
    );

    const nonce = getNonce();

    return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}' ;">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleVSCodeUri}" rel="stylesheet" />
				<link href="${styleMainUri}" rel="stylesheet" />
				<title>Kanban Board</title>
			</head>
			<body>
				<div id="app"></div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  private getDocumentAsJson(document: vscode.TextDocument): KanbanBoard {
    const text = document.getText();
    if (text.trim().length === 0) {
      return {
        dataVersion: 0,
        columns: [],
      };
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "Could not get document as json. Content is not valid json"
      );
    }
  }
}

function updateTextDocument(
  document: vscode.TextDocument,
  objectToSerialize: KanbanBoard
) {
  const edit = new vscode.WorkspaceEdit();

  // Just replace the entire document every time for this example extension.
  // A more complete extension should compute minimal edits instead.
  edit.replace(
    document.uri,
    new vscode.Range(0, 0, document.lineCount, 0),
    JSON.stringify(objectToSerialize, null, 2)
  );

  return vscode.workspace.applyEdit(edit);
}
