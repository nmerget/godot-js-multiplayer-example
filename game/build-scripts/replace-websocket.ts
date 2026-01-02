import { readFileSync, writeFileSync } from "node:fs";

const host = process.env.HOST || "localhost";
const port = process.env.PORT || "3000";
const protocol = process.env.PROTOCOL || "ws";
const socketFile = "./src/socket-singleton.ts";

console.log(`Updating socket file to ${protocol}://${host}:${port}`);

const content = readFileSync(socketFile, "utf8");
const updated = content.replaceAll(
  "ws://localhost:3000",
  `${protocol}://${host}:${port}`,
);
writeFileSync(socketFile, updated);
