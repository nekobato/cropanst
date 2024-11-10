import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Crop and Stream",
  description: "Crop to sharing screen",
  themeConfig: {
    appicon: "/assets/images/appicon.png",
    thumbnails: [
      "/assets/images/thumbnail1.png",
      "/assets/images/thumbnail2.png",
      "/assets/images/thumbnail3.png",
      "/assets/images/thumbnail4.png",
    ],
  },
});
