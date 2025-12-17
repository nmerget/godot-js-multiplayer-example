import { spawn } from "child_process";
import { platform } from "os";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

export const osMap: Record<string, string> = {
  win32: "windows",
  darwin: "macos",
  linux: "linux",
};

const __dirname = dirname(fileURLToPath(import.meta.url));

const os = osMap[platform()];
if (!os) throw new Error(`Unsupported platform: ${platform()}`);

const editorPath =
  os === "macos"
    ? "./editor/Godot.app/Contents/MacOS/Godot"
    : os === "windows"
      ? "./editor/godot.windows.editor.x86_64.exe"
      : "./editor/godot.linuxbsd.editor.x86_64";

const gamePath = resolve(__dirname, "../../game");

spawn(editorPath, ["--editor", "--path", gamePath], { stdio: "inherit" });
