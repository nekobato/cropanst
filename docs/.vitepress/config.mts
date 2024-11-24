import { defineConfigWithTheme } from "vitepress";
import { ThemeConfig } from "./types/themeConfig";
import rootPkg from "../../package.json";

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
  head: [["link", { rel: "icon", href: "./favicon.png" }]],
  title: "Crop and Stream",
  description:
    "スクリーンの一部を切り取ってストリーミング共有するためのウィンドウを作るアプリケーション",
  themeConfig: {
    appicon: "./images/appicon.png",
    thumbnails: [
      "./images/thumbnail1.png",
      "./images/thumbnail2.png",
      "./images/thumbnail3.png",
      "./images/thumbnail4.png",
    ],
    downloadLinks: {
      macOS: {
        arm64:
          "https://github.com/nekobato/cropanst/releases/download/v0.0.3/Crop-and-Stream-0.0.3-arm64.dmg",
        x64: "https://github.com/nekobato/cropanst/releases/download/v0.0.3/Crop-and-Stream-0.0.3-x64.dmg",
      },
    },
    refLinks: [
      {
        type: "github",
        url: rootPkg.repository.url,
      },
    ],
  },
});
