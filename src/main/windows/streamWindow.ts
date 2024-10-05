import { app, BrowserWindow } from "electron";
import { isDevelopment, pageRoot, preload } from "../static";

export const createWindow = (data: {
  displayId: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  size: {
    width: number;
    height: number;
  };
}) => {
  const win = new BrowserWindow({
    title: "Crop & Stream",
    webPreferences: {
      preload: preload,
    },
    show: false,
    fullscreenable: false,
    resizable: false,
    frame: true,
    hasShadow: true,
    skipTaskbar: false,
  });

  win.setContentSize(data.bounds.width, data.bounds.height);
  win.center();

  if (isDevelopment) {
    win.loadURL(pageRoot + "#/stream");
    win.webContents.openDevTools();
  } else {
    win.loadFile(pageRoot, { hash: "/stream" });
  }

  win.webContents.on("did-finish-load", () => {
    win.showInactive();
    win.hide();
    app.dock.show();
    win.webContents.send("cropper:capture", data);
  });

  return win;
};
