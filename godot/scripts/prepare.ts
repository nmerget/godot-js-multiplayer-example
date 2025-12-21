import {
  createWriteStream,
  existsSync,
  mkdirSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { pipeline } from "stream/promises";
import { platform } from "os";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";
import { getExportPresets } from "./export-presets.ts";
import { osMap } from "./os.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  gitTag: "v1.1.0-web-dlink",
  godotVersion: "4.5" as "4.4" | "4.5",
  editorEngine: "v8" as "v8" | "qjs-ng",
  templateEngine: "qjs-ng" as "browser" | "qjs-ng",
};

const os = osMap[platform()];
if (!os) throw new Error(`Unsupported platform: ${platform()}`);

const editorDir = "./editor";
const templatesDir = "./templates";

if (!existsSync(editorDir)) mkdirSync(editorDir);
if (!existsSync(templatesDir)) mkdirSync(templatesDir);

const downloads = [
  {
    name: "editor",
    url: `https://github.com/godotjs/GodotJS/releases/download/${config.gitTag}/${os}-${os === "macos" ? "editor-app" : "editor"}-${config.godotVersion}-${config.editorEngine}.zip`,
    marker:
      os === "macos"
        ? "Godot.app"
        : os === "windows"
          ? "godot.windows.editor.x86_64.exe"
          : "godot.linuxbsd.editor.x86_64",
    targetDir: editorDir,
  },
  {
    name: "web-template-debug",
    url: `https://github.com/godotjs/GodotJS/releases/download/${config.gitTag}/web-template_debug-${config.godotVersion}-${config.templateEngine}.zip`,
    marker: `web-template_debug-${config.godotVersion}-${config.templateEngine}`,
    targetDir: templatesDir,
  },
  {
    name: "web-template-release",
    url: `https://github.com/godotjs/GodotJS/releases/download/${config.gitTag}/web-template_release-${config.godotVersion}-${config.templateEngine}.zip`,
    marker: `web-template_release-${config.godotVersion}-${config.templateEngine}`,
    targetDir: templatesDir,
  },
];

for (const { name, url, marker, targetDir } of downloads) {
  const markerPath = `${targetDir}/${marker}`;

  if (existsSync(markerPath)) {
    console.log(`Skipping ${name}: already exists`);
    continue;
  }

  const output = `${targetDir}/${name}.zip`;

  console.log(`Downloading ${name}: ${url}`);

  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to download: ${response.statusText}`);

  await pipeline(response.body!, createWriteStream(output));

  console.log(`Extracting: ${output}`);

  const zip = new AdmZip(output);

  if (name === "editor") {
    const entries = zip.getEntries();
    const rootDir = entries[0]?.entryName.split("/")[0];

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const relativePath = rootDir
        ? entry.entryName.substring(rootDir.length + 1)
        : entry.entryName;
      if (relativePath) {
        zip.extractEntryTo(entry, targetDir, false, true, false, relativePath);
      }
    }
  } else {
    zip.extractAllTo(targetDir, true);
  }

  unlinkSync(output);
}

console.log("Done: All files extracted");

const exportPresetsPath = resolve(__dirname, "../../game/export_presets.cfg");

const debugTemplatePath = resolve(templatesDir, downloads[1].marker);
const releaseTemplatePath = resolve(templatesDir, downloads[2].marker);
writeFileSync(
  exportPresetsPath,
  getExportPresets(debugTemplatePath, releaseTemplatePath),
);
console.log(`Created: ${exportPresetsPath}`);
