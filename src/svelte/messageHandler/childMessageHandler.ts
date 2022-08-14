import type { KanbanBoard } from "../../index";
import type { ChildMessages } from "../../parentMessageHandler";

export type ParentMessages = {
  setBoardData: KanbanBoard;
};

export type ParentMessage = {
  type: keyof ParentMessages;
};

export function createChildMessageHandler(handler: {
  [key in keyof ParentMessages]: (payload: ParentMessages[key]) => void;
}) {
  return (
    event: MessageEvent<{ type: keyof ParentMessages; payload: any }>
  ) => {
    handler[event.data.type](event.data.payload);
  };
}

export function createChildMessage<T extends keyof ChildMessages>(
  messageType: T,
  messagePayload: ChildMessages[T]
) {
  return {
    type: messageType,
    payload: messagePayload,
  };
}
