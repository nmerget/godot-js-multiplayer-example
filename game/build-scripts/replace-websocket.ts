import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { cpSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const backendDistPath = resolve(__dirname, "../../backend/dist/build");
const gamePath = resolve(__dirname, "../../game");
const buildPath = resolve(gamePath, "build");
cpSync(buildPath, backendDistPath, { recursive: true });
