import {
  BrowserWindow,
  Menu,
  app,
  ipcMain,
  screen,
  session,
  desktopCapturer,
  systemPreferences,
} from "electron";
import log from "electron-log";
import { checkUpdate } from "./autoupdater";
import {
  getDisplaySizePhysical,
  toPhysicalLocalRect,
} from "./displayMetrics";
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

// https://www.electronjs.org/ja/docs/latest/tutorial/performance#8-%E3%83%87%E3%83%95%E3%82%A9%E3%83%AB%E3%83%88%E3%81%AE%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%81%8C%E4%B8%8D%E8%A6%81%E3%81%AA%E3%82%89-menusetapplicationmenunull-%E3%82%92%E5%91%BC%E3%81%B3%E5%87%BA%E3%81%99
Menu.setApplicationMenu(null);

let cropperWindows = new Map<number, BrowserWindow>();
let isCropperActive = false;
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
          const boundsDipLocal = bounds;
          const boundsDipGlobal = {
            x: boundsDipLocal.x + targetDisplay.bounds.x,
            y: boundsDipLocal.y + targetDisplay.bounds.y,
            width: boundsDipLocal.width,
            height: boundsDipLocal.height,
          };
          // Retina / HiDPI: selection is DIP, but capture cropping is physical pixels.
          const boundsPhysicalLocal = toPhysicalLocalRect(
            boundsDipLocal,
            targetDisplay
          );
          const displaySizePhysical = getDisplaySizePhysical(targetDisplay);

          frameWindow = createFrameWindow({
            x: boundsDipGlobal.x,
            y: boundsDipGlobal.y,
            width: boundsDipGlobal.width,
            height: boundsDipGlobal.height,
          });
          streamWindow = createStreamWindow({
            displayId: Number(displayId),
            boundsDip: boundsDipLocal,
            boundsPhysical: boundsPhysicalLocal,
            displaySizePhysical,
          });
        }
        break;
      case "error":
        log.error(payload);
        break;
    }
  });
}

/**
 * Create or update a cropper window so it matches the given display's bounds in DIP.
 */
function upsertCropperWindow(display: Electron.Display): void {
  const existing = cropperWindows.get(display.id);

  if (existing && !existing.isDestroyed()) {
    existing.setBounds(display.bounds);
    return;
  }

  if (existing?.isDestroyed()) {
    cropperWindows.delete(display.id);
  }

  const win = createCropperWindow(display);
  cropperWindows.set(display.id, win);
}

/**
 * Dispose of a cropper window for a display id if it exists.
 */
function disposeCropperWindow(displayId: number): void {
  const win = cropperWindows.get(displayId);
  if (!win) {
    return;
  }

  cropperWindows.delete(displayId);

  if (win.isDestroyed()) {
    return;
  }

  win.removeAllListeners();
  win.close();
}

/**
 * Synchronize cropper windows with the current displays while cropper mode is active.
 */
function syncCropperWindows(): void {
  if (!isCropperActive) {
    return;
  }

  const displays = screen.getAllDisplays();
  const displayIds = new Set(displays.map((display) => display.id));

  displays.forEach((display) => {
    upsertCropperWindow(display);
  });

  Array.from(cropperWindows.keys()).forEach((displayId) => {
    if (!displayIds.has(displayId)) {
      disposeCropperWindow(displayId);
    }
  });
}

/**
 * Start cropper windows and enable display synchronization.
 */
function startCropperWindows(): void {
  isCropperActive = true;
  syncCropperWindows();
}

/**
 * Close all cropper windows and disable display synchronization.
 */
function removeCropperWindows(): void {
  isCropperActive = false;

  cropperWindows.forEach((cropperWindow) => {
    if (cropperWindow.isDestroyed()) {
      return;
    }
    cropperWindow.removeAllListeners();
    cropperWindow.close();
  });

  cropperWindows.clear();
}

/**
 * Keep cropper windows in sync with display lifecycle and metrics changes.
 */
function initDisplayEvents(): void {
  screen.on("display-added", () => {
    syncCropperWindows();
  });

  screen.on("display-removed", () => {
    syncCropperWindows();
  });

  screen.on("display-metrics-changed", (_, display, changedMetrics) => {
    if (!isCropperActive) {
      return;
    }

    const shouldResync = changedMetrics.some(
      (metric) =>
        metric === "bounds" ||
        metric === "workArea" ||
        metric === "scaleFactor" ||
        metric === "rotation"
    );

    if (!shouldResync) {
      return;
    }

    upsertCropperWindow(display);
    syncCropperWindows();
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

app.on("before-quit", () => {
  streamWindow?.removeAllListeners();
  frameWindow?.close();
  streamWindow = null;
  frameWindow = null;
});

app.on("ready", async () => {
  if (process.platform === "darwin") {
    await systemPreferences.askForMediaAccess("camera");
  }
  initMenu();
  initEvents();
  initDisplayEvents();
  startCropperWindows();
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
