import * as vscode from "vscode";
import { KanbanBoard } from ".";
import { ParentMessages } from "./svelte/messageHandler/childMessageHandler";

export type ChildMessages = {
  saveBoard: KanbanBoard;
};

export function createParentMessageHandler(handler: {
  [key in keyof ChildMessages]: (payload: ChildMessages[key]) => void;
}) {
  return (event: MessageEvent<{ type: keyof ChildMessages; payload: any }>) => {
    console.log(
      `[Message] type: ${event.data.type} data: ${JSON.stringify(
        event.data.payload
      )}`
    );
    handler[event.data.type](event.data.payload);
  };
}

export function createParentMessage<T extends keyof ParentMessages>(
  messageType: T,
  messagePayload: ParentMessages[T]
) {
  return {
    type: messageType,
    payload: messagePayload,
  };
}
