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
import { checkUpdate } from "./autoupdater";
import { createWindow as createStreamWindow } from "./streamWindow";
import { createWindow as createCropperWindow } from "./cropperWindow";

const isDevelopment = process.env.NODE_ENV === "development";

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let streamWindow: BrowserWindow | null;
let cropperWindow: BrowserWindow | null;

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
        const allDisplays = screen.getAllDisplays();
        const targetDisplay = allDisplays.find(
          (display) => display.id === Number(payload.displayId)
        );
        cropperWindow?.hide();
        if (targetDisplay) {
          createStreamWindow({
            ...payload,
            size: {
              width: targetDisplay.bounds.width * targetDisplay.scaleFactor,
              height: targetDisplay.bounds.height * targetDisplay.scaleFactor,
            },
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
  // screen.getAllDisplays().forEach((display) => {
  //   createCropperWindow(display);
  // });
  const display = screen.getPrimaryDisplay();
  cropperWindow = createCropperWindow(display);
}

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (!streamWindow && !cropperWindow) {
    createCropperWindowsOnAllDisplays();
  }
});

app.on("ready", async () => {
  initEvents();
  createCropperWindowsOnAllDisplays();

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      callback({ video: sources[0], audio: "loopback" });
    });
  });
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
