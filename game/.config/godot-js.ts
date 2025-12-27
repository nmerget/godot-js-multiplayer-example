import type { GodotJsConfig } from "@godot-js/editor";

const config: GodotJsConfig = {
  buildType: "release",
  tsConfigPath: ".",
  rootPath: ".",
  buildPath: "./build",
  godotVersion: "4.5",
  editorJSEngine: "v8",
  editorPath: "./.editor",
  templatesPath: "./.editor/templates",
  exportTemplates: [
    {
      target: "web",
      engine: "qjs-ng",
    },
  ],
  gitTag: "v1.1.0-editor",
};

export default config;
