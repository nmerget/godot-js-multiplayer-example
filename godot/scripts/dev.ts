import { spawn } from "child_process";
import { platform } from "os";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { getEditorPath, osMap } from "./os.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const os = osMap[platform()];
if (!os) throw new Error(`Unsupported platform: ${platform()}`);

const gamePath = resolve(__dirname, "../../game");

spawn(getEditorPath(os), ["--editor", "--path", gamePath], {
  stdio: "inherit",
});
