import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";

import { rendererConfig } from "./webpack/webpack.renderer";
import { mainConfig } from "./webpack/webpack.main";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: [
      "./src/assets/data",
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {},
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
