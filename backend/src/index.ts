import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import type { WSContext } from "hono/ws";
import { uuid } from "./utils.js";
import type { WSMessage, User, UserWithSocket } from "@shared";

const app = new Hono();

const idMap = new Map<string, UserWithSocket>();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const sendMessage = (ws: WSContext<WebSocket>, message: WSMessage) => {
  ws.send(JSON.stringify(message));
};
const sendMessageToAll = (message: WSMessage) => {
  idMap.forEach(({ ws }) => {
    sendMessage(ws, message);
  });
};

app.get(
  "/",
  upgradeWebSocket((c) => {
    return {
      onOpen: (_, ws) => {
        ws.uuid = uuid();

        const user: User = { uuid: ws.uuid, name: `User ${ws.uuid}` };

        idMap.set(ws.uuid, { ...user, ws });
        const allUsers: User[] = Array.from(idMap.values()).map(
          ({ uuid, name }): User => ({ uuid, name }),
        );
        sendMessage(ws, {
          type: "setup",
          sender: ws.uuid,
          allUsers,
        });
        sendMessageToAll({
          type: "new-user",
          sender: ws.uuid,
          user,
        });
      },
      onMessage: (event, ws) => {
        sendMessageToAll({
          type: "message",
          sender: ws.uuid,
          payload: `User ${ws.uuid}: ${event.data}`,
        });
      },
      onClose: (evt, ws) => {
        if (!ws.uuid) return;

        idMap.delete(ws.uuid);
        sendMessageToAll({
          type: "user-left",
          sender: ws.uuid,
        });
      },
    };
  }),
);

const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

injectWebSocket(server);
