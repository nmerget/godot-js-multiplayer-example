import { spawn } from "child_process";
import { platform } from "os";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { getEditorPath, osMap } from "./os.ts";
import { cpSync, existsSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const os = osMap[platform()];
if (!os) throw new Error(`Unsupported platform: ${platform()}`);

const gamePath = resolve(__dirname, "../../game");
const buildPath = resolve(gamePath, "build");

const backendDistPath = resolve(__dirname, "../../backend/dist/build");

if (!existsSync(buildPath)) {
  mkdirSync(buildPath);
}

const child = spawn(
  getEditorPath(os),
  ["--editor", "--headless", "--path", gamePath, "--export-release", "Web"],
  {
    stdio: "inherit",
  },
);

child.on("close", () => {
  cpSync(buildPath, backendDistPath, { recursive: true });
});
