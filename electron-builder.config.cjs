require("dotenv").config();
const pkg = require("./package.json");
const productName = "Crop and Stream";

const config = {
  appId: `net.nekobato.${productName}`,
  asar: true,
  productName,
  directories: {
    output: `release/${pkg.version}`,
  },
  files: ["out"],
  mac: {
    target: ["default"],
    icon: "out/renderer/icons/mac/icon.icns",
    category: "public.app-category.productivity",
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist",
    notarize: {
      teamId: process.env.APPLE_TEAM_ID,
    },
    publish: ["github"],
  },
  win: {
    target: [
      {
        target: "portable",
        arch: ["x64"],
      },
    ],
    publish: ["github"],
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
  },
};

module.exports = config;
