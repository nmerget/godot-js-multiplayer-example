export const osMap: Record<string, string> = {
  win32: "windows",
  darwin: "macos",
  linux: "linux",
};

export const getEditorPath = (os: string): string => {
  return os === "macos"
    ? "./editor/Godot.app/Contents/MacOS/Godot"
    : os === "windows"
      ? "./editor/godot.windows.editor.x86_64.exe"
      : "./editor/godot.linuxbsd.editor.x86_64";
};
