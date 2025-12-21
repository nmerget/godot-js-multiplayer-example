import { readFileSync, writeFileSync } from "node:fs";

const host = process.env.HOST || "localhost";
const port = process.env.PORT || "3000";
const protocol = process.env.PROTOCOL || "ws";
const socketFile = ".godot/GodotJS/src/socket-singleton.js";

console.log(`Updating socket file to ${host}:${port}`);

const content = readFileSync(socketFile, "utf8");
const updated = content.replace(
  /ws:\/\/localhost:3000/g,
  `${protocol}://${host}:${port}`,
);
writeFileSync(socketFile, updated);
