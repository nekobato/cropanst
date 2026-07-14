import { app, BrowserWindow } from "electron";
import { isDevelopment, pageRoot, preload } from "../static";

type Rect = Electron.Rectangle;
type Size = Pick<Electron.Size, "width" | "height">;

/**
 * Create the stream window sized in DIP while sending physical metrics
 * to the renderer for accurate cropping on HiDPI displays.
 */
export const createWindow = (data: {
  displayId: number;
  boundsDip: Rect;
  displaySizeDip: Size;
  displaySizePhysical: Size;
}): BrowserWindow => {
  const win = new BrowserWindow({
    title: "Crop & Stream",
    webPreferences: {
      preload: preload,
    },
    show: false,
    fullscreenable: false,
    resizable: false,
    frame: false,
    hasShadow: true,
    focusable: true,
  });

  win.setContentSize(data.boundsDip.width, data.boundsDip.height);
  win.center();

  if (isDevelopment) {
    win.loadURL(pageRoot + "#/stream");
    win.webContents.openDevTools();
  } else {
    win.loadFile(pageRoot, { hash: "/stream" });
  }

  win.webContents.on("did-finish-load", () => {
    win.show();
    if (app.dock) {
      app.dock.show();
    }
    win.webContents.send("cropper:capture", data);
    win.focus();
  });

  win.on("focus", () => {
    win.webContents.send("focus");
  });

  win.on("blur", () => {
    win.webContents.send("blur");
  });

  win.on("closed", () => {
    app.quit();
  });

  return win;
};
