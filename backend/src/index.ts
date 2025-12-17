import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import type { WSContext } from "hono/ws";
import type { WSMessage, User } from "@shared";
import { faker } from "@faker-js/faker";

type UserWithSocket = User & {
  ws: WSContext<WebSocket>;
};

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
        ws.uuid = faker.string.uuid();
        ws.username = faker.internet.username();
        ws.avatar = faker.image.avatar();

        const user: User = {
          uuid: ws.uuid,
          username: ws.username,
          avatar: ws.avatar,
        };

        idMap.set(ws.uuid, { ...user, ws });
        const allUsers: User[] = Array.from(idMap.values()).map(
          ({ uuid, username, avatar }): User => ({ uuid, username, avatar }),
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
