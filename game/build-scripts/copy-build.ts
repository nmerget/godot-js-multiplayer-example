import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { cpSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const backendDistPath = resolve(__dirname, "../../backend/dist/build");
const gamePath = resolve(__dirname, "../../game");
const buildPath = resolve(gamePath, "build");
cpSync(buildPath, backendDistPath, { recursive: true });
