import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { rendererConfig } from "./webpack/webpack.renderer";
import { mainConfig } from "./webpack/webpack.main";
import path from "path";

const config: ForgeConfig = {
  packagerConfig: {
    name: "Stash",
    asar: true,
    icon: "./src/assets/icons/app_icon",
    extraResource: [
      "./src/assets/data",
    ],
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        iconUrl: path.join(__dirname, "/src/assets/icons/installer_icon.ico"),
        setupIcon: path.join(__dirname, "/src/assets/icons/installer_icon.ico"),
        skipUpdateIcon: true,
      },
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        icon: path.join(__dirname, "/src/assets/icons/installer_icon.icns"),
      }
    },
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: "img-src 'self' https://flagcdn.com",
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/index.html",
            js: "./src/renderer.tsx",
            name: "main_window",
            preload: {
              js: "./electron/preload.ts",
            },
          },
        ],
      },
    }),
  ],
};

export default config;
