import { defineConfigWithTheme } from "vitepress";
import { ThemeConfig } from "./types/themeConfig";
import rootPkg from "../../package.json";

const title = "Crop and Stream";
const description =
  "今すぐにスクリーンの一部を切り取って画面共有する デスクトップアプリケーション";

const repositoryUrl = rootPkg.repository.url;
const version = rootPkg.version;

// https://vitepress.dev/reference/site-config
export default defineConfigWithTheme<ThemeConfig>({
  lang: "ja",
  head: [
    ["link", { rel: "icon", href: "./favicon.png" }],
    ["meta", { name: "og:type", content: "website" }],
    ["meta", { name: "og:url", content: repositoryUrl }],
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
        arm64: `${repositoryUrl}/releases/download/v${version}/Crop-and-Stream-${version}-arm64.dmg`,
        x64: `${repositoryUrl}/releases/download/v${version}/Crop-and-Stream-${version}.dmg`,
      },
      windows: {
        x64: `${repositoryUrl}/releases/download/v${version}/Crop-and-Stream-Setup-${version}.exe`,
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
