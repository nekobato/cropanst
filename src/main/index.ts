import {
  BrowserWindow,
  Menu,
  app,
  ipcMain,
  protocol,
  screen,
  session,
  desktopCapturer,
} from "electron";
import log from "electron-log";
import {
  hasScreenCapturePermission,
  hasPromptedForPermission,
} from "mac-screen-capture-permissions";
import { checkUpdate } from "./autoupdater";
import { createWindow as createStreamWindow } from "./windows/streamWindow";
import { createWindow as createCropperWindow } from "./windows/cropperWindow";
import { createWindow as createFrameWindow } from "./windows/frameWindow";

const isDevelopment = process.env.NODE_ENV === "development";

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

if (process.platform === "darwin") {
  const hadAskForPermission = hasPromptedForPermission();
  const hasPermission = hasScreenCapturePermission();
  if (!hasPermission && !hadAskForPermission) {
    app.quit();
    process.exit(0);
  }

  if (!hasPermission) {
    app.quit();
    process.exit(0);
  }
}

let cropperWindows: BrowserWindow[] = [];
let frameWindow: BrowserWindow | null;
let streamWindow: BrowserWindow | null;

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

checkUpdate();

const menu = Menu.buildFromTemplate([{ role: "appMenu" }]);
Menu.setApplicationMenu(menu);

function initEvents() {
  ipcMain.on("renderer-event", (_, event: string, payload: any) => {
    switch (event) {
      case "exit":
        app.quit();
        break;
      case "cropper:capture":
        const {
          displayId,
          bounds,
        }: {
          displayId: number;
          bounds: { x: number; y: number; width: number; height: number };
        } = payload;

        const allDisplays = screen.getAllDisplays();
        const targetDisplay = allDisplays.find(
          (display) => display.id === Number(displayId)
        );
        setDisplayMediaRequestHandler(displayId);
        cropperWindows.forEach((cropperWindow) => {
          cropperWindow.close();
        });
        cropperWindows = [];

        if (targetDisplay) {
          frameWindow = createFrameWindow({
            x: bounds.x + targetDisplay.bounds.x,
            y: bounds.y + targetDisplay.bounds.y,
            width: bounds.width,
            height: bounds.height,
          });
          streamWindow = createStreamWindow({
            ...payload,
            size: {
              width: targetDisplay.bounds.width * targetDisplay.scaleFactor,
              height: targetDisplay.bounds.height * targetDisplay.scaleFactor,
            },
          });
          streamWindow.on("closed", () => {
            streamWindow?.removeAllListeners();
            frameWindow?.close();
            streamWindow = null;
            frameWindow = null;
          });
        }
        break;
      case "error":
        log.error(payload);
        break;
    }
  });
}

function createCropperWindowsOnAllDisplays() {
  screen.getAllDisplays().forEach((display) => {
    cropperWindows.push(createCropperWindow(display));
  });
}

function setDisplayMediaRequestHandler(displayId: number) {
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      const source = sources.find(
        (soure) => soure.display_id === displayId.toString()
      );
      callback({ video: source, audio: "loopback" });
    });
  });
}

app.on("window-all-closed", () => {
  app.quit();
});

app.on("ready", async () => {
  initEvents();
  createCropperWindowsOnAllDisplays();
});

if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
