import { BrowserWindow } from "electron";
import { isDevelopment, pageRoot, preload } from "../static";

/**
 * Create a hidden cropper window that matches the display's DIP bounds.
 */
export const createWindow = (display: Electron.Display): BrowserWindow => {
  const { x, y, width, height } = display.bounds;
  const win = new BrowserWindow({
    title: "Cropping...",
    x,
    y,
    width,
    height,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    transparent: true,
    roundedCorners: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload,
    },
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  win.on("blur", () => {
    win.setAlwaysOnTop(true, "screen-saver");
  });

  win.once("ready-to-show", () => {
    win.show();
    win.focus();
  });

  if (isDevelopment) {
    win.loadURL(pageRoot + `#/cropper/${display.id}`);
    win.webContents.openDevTools();
  } else {
    win.loadFile(pageRoot, { hash: `/cropper/${display.id}` });
  }

  return win;
};
