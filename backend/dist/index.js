import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { uuid } from "./utils.js";
const app = new Hono();
const idMap = new Map();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });
const sendMessage = (ws, message) => {
    ws.send(JSON.stringify(message));
};
const sendMessageToAll = (message) => {
    idMap.forEach(({ ws }) => {
        sendMessage(ws, message);
    });
};
app.get("/", upgradeWebSocket((c) => {
    return {
        onOpen: (_, ws) => {
            ws.uuid = uuid();
            const user = { uuid: ws.uuid, name: `User ${ws.uuid}` };
            idMap.set(ws.uuid, { ...user, ws });
            const allUsers = Array.from(idMap.values()).map(({ uuid, name }) => ({ uuid, name }));
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
            if (!ws.uuid)
                return;
            idMap.delete(ws.uuid);
            sendMessageToAll({
                type: "user-left",
                sender: ws.uuid,
            });
        },
    };
}));
const server = serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
injectWebSocket(server);
