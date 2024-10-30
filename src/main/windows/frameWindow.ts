import { BrowserWindow, Rectangle } from "electron";
import { isDevelopment, pageRoot, preload } from "../static";

export const createWindow = (bounds: Rectangle) => {
  const win = new BrowserWindow({
    title: "Streaming frame",
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    transparent: true,
    roundedCorners: false,
    hasShadow: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload,
      devTools: isDevelopment,
    },
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true);

  win.on("blur", () => {
    win.setAlwaysOnTop(true, "screen-saver");
  });

  if (isDevelopment) {
    win.loadURL(pageRoot + `#/frame`);
    win.webContents.openDevTools();
  } else {
    win.loadFile(pageRoot, { hash: `/frame` });
  }

  win.setBounds({
    // window border 1pxとframe border 1pxがあるので2pxずらす
    x: bounds.x - 2,
    y: bounds.y - 2,
    width: bounds.width + 4,
    height: bounds.height + 4,
  });

  win.webContents.on("did-finish-load", () => {
    win.show();
  });

  return win;
};
