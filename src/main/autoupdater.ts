import { dialog } from "electron";
import { autoUpdater } from "electron-updater";

export const checkUpdate = () => {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        type: "info",
        buttons: ["いいよ", "ダメ"],
        title: "アップデートがあります",
        message: "アップデートがあります",
        detail: "アプリケーションを再起動して\nアップデートしてね",
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  return autoUpdater;
};
