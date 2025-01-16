require("dotenv").config();
const pkg = require("./package.json");

const config = {
  appId: `net.nekobato.CropAndStream`,
  asar: true,
  productName: "Crop and Stream",
  directories: {
    output: `release/${pkg.version}`,
  },
  files: ["out"],
  mac: {
    target: {
      target: "dmg",
      arch: ["arm64", "x64"],
    },
    icon: "build/icon.icns",
    category: "public.app-category.productivity",
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist",
    publish: ["github"],
  },
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
    icon: "build/icon.ico",
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
