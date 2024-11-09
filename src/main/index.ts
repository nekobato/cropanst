import {
  BrowserWindow,
  Menu,
  app,
  ipcMain,
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
import { isDevelopment } from "./static";

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

// https://www.electronjs.org/ja/docs/latest/tutorial/performance#8-%E3%83%87%E3%83%95%E3%82%A9%E3%83%AB%E3%83%88%E3%81%AE%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%8C%E4%B8%8D%E8%A6%81%E3%81%AA%E3%82%89-menusetapplicationmenunull-%E3%82%92%E5%91%BC%E3%81%B3%E5%87%BA%E3%81%99
Menu.setApplicationMenu(null);

let cropperWindows: BrowserWindow[] = [];
let frameWindow: BrowserWindow | null;
let streamWindow: BrowserWindow | null;

checkUpdate();

function initMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "Application",
      role: "appMenu",
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

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

        const targetDisplay = screen
          .getAllDisplays()
          .find((display) => display.id === Number(displayId));

        setDisplayMediaRequestHandler(displayId);
        removeCropperWindows();

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

function removeCropperWindows() {
  cropperWindows.forEach((cropperWindow) => {
    cropperWindow.removeAllListeners();
    cropperWindow.close();
  });
  cropperWindows = [];
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

app.on("before-quit", () => {
  streamWindow?.removeAllListeners();
  frameWindow?.close();
  streamWindow = null;
  frameWindow = null;
});

app.on("ready", async () => {
  initMenu();
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
