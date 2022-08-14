import type { KanbanBoard } from "../index";
import { writable } from "svelte/store";
import {
  createChildMessageHandler,
  createChildMessage,
} from "./messageHandler/childMessageHandler";
import { vscode } from "./vscode";

export const board = writable<KanbanBoard>({ columns: [], dataVersion: 0 });

const messageHandler = createChildMessageHandler({
  setBoardData(payload) {
    board.set(payload);
  },
});

window.addEventListener("message", messageHandler);

board.subscribe((newBoard) => {
  vscode.postMessage(createChildMessage("saveBoard", newBoard));
});
