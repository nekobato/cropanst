import { BrowserWindow } from "electron";
import { isDevelopment, pageRoot, preload } from "../static";

export const createWindow = (display: Electron.Display) => {
  const win = new BrowserWindow({
    title: "Cropping...",
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    transparent: true,
    roundedCorners: false,
    hasShadow: false,
    webPreferences: {
      preload,
    },
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  win.on("blur", () => {
    win.setAlwaysOnTop(true, "screen-saver");
  });

  if (isDevelopment) {
    win.loadURL(pageRoot + `#/cropper/${display.id}`);
    win.webContents.openDevTools();
  } else {
    win.loadFile(pageRoot, { hash: `/cropper/${display.id}` });
  }

  win.setBounds(display.bounds);

  win.webContents.on("did-finish-load", () => {
    win.show();
    win.focus();
  });

  return win;
};
