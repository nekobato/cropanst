import { defineConfigWithTheme } from "vitepress";
import { ThemeConfig } from "./types/themeConfig";
import rootPkg from "../../package.json";

const title = "Crop and Stream";
const description =
  "スクリーンの一部を切り取って画面共有するためのアプリケーション";

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
  lang: "ja",
  head: [
    ["link", { rel: "icon", href: "./favicon.png" }],
    ["meta", { name: "og:type", content: "website" }],
    [
      "meta",
      { name: "og:url", content: "https://nekobato.github.io/cropanst/" },
    ],
    ["meta", { name: "og:image", content: "/images/thumbnail1.png" }],
    ["meta", { name: "og:title", content: title }],
    ["meta", { name: "og:site_name", content: title }],
    ["meta", { name: "og:description", content: description }],
    ["meta", { name: "og:locale", content: "ja_JP" }],
    ["meta", { name: "twitter:card", content: "summary" }],
  ],
  title,
  base: "/cropanst/",
  assetsDir: "assets",
  description,
  themeConfig: {
    appicon: "/images/appicon.png",
    thumbnails: [
      "/images/thumbnail1.png",
      "/images/thumbnail2.png",
      "/images/thumbnail3.png",
      "/images/thumbnail4.png",
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
