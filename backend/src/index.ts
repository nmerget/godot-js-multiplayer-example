import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import type { WSContext } from "hono/ws";
import type { User, WSMessage } from "@shared";
import { faker } from "@faker-js/faker";
import { serveStatic } from "@hono/node-server/serve-static";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  "/ws",
  upgradeWebSocket(() => {
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
          ({ uuid, username, avatar, state }): User => ({
            uuid,
            username,
            avatar,
            state,
          }),
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
        try {
          const parsed = JSON.parse(event.data.toString());
          if (!parsed || typeof parsed !== "object" || !parsed.type) {
            return; // Invalid message structure
          }
          const wsMessage: WSMessage = parsed as WSMessage;

          if (wsMessage.type === "player-state" && ws.uuid) {
            const user = idMap.get(ws.uuid);
            if (!user) return;
            user.state = wsMessage.state;
          }

          sendMessageToAll({ ...wsMessage, sender: ws.uuid });
        } catch {
          return; // Invalid JSON
        }
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

if (existsSync(resolve(__dirname, "build"))) {
  app.get(
    "*",
    serveStatic({
      root: "./dist/build",
      onFound: (path, ctx) => {
        ctx.header("Cross-Origin-Embedder-Policy", "require-corp");
        ctx.header("Cross-Origin-Opener-Policy", "same-origin");
      },
    }),
  );
}

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
