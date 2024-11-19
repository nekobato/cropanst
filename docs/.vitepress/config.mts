import { defineConfigWithTheme } from "vitepress";
import { ThemeConfig } from "./types/themeConfig";
import rootPkg from "../../package.json";

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
  head: [["link", { rel: "icon", href: "/favicon.png" }]],
  title: "Crop and Stream",
  description:
    "スクリーンの一部を切り取ってストリーミング共有するためのウィンドウを作るアプリケーション",
  themeConfig: {
    appicon: "/assets/images/appicon.png",
    thumbnails: [
      "/assets/images/thumbnail1.png",
      "/assets/images/thumbnail2.png",
      "/assets/images/thumbnail3.png",
      "/assets/images/thumbnail4.png",
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
