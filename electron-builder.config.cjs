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
  // win: {
  //   target: [
  //     {
  //       target: "nsis",
  //       arch: ["x64"],
  //     },
  //   ],
  //   icon: "out/renderer/icons/win/icon.ico",
  //   publish: ["github"],
  // },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
  },
};

module.exports = config;
