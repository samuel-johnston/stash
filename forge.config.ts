import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerDMG } from "@electron-forge/maker-dmg";

import { rendererConfig } from "./webpack/webpack.renderer";
import { mainConfig } from "./webpack/webpack.main";

const config: ForgeConfig = {
  packagerConfig: {
    name: "Stash",
    asar: true,
    extraResource: [
      "./src/assets/data",
    ],
  },
  makers: [
    new MakerSquirrel(),
    new MakerDMG(),
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
