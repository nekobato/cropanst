import { app, BrowserWindow } from "electron";
import { isDevelopment, pageRoot, preload } from "./static";

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
    width: data.bounds.width,
    height: data.bounds.height,
    title: "Crop and Stream",
    webPreferences: {
      preload: preload,
    },
    show: false,
    fullscreenable: false,
    center: true,
  });

  if (isDevelopment) {
    win.loadURL(pageRoot + "#/stream");
    win.webContents.openDevTools();
  } else {
    win.loadFile(pageRoot, { hash: "/stream" });
  }

  win.webContents.on("did-finish-load", () => {
    win.show();
    app.dock.show();
    win.webContents.send("cropper:capture", data);
  });

  return win;
};
