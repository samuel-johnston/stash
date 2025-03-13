import type { ForgeConfig } from '@electron-forge/shared-types';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'path';

const config: ForgeConfig = {
  packagerConfig: {
    name: 'Stash Investment Tracker',
    asar: true,
    icon: './src/assets/icons/app_icon',
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: path.join(__dirname, '/src/assets/icons/installer_icon.ico'),
        setupIcon: path.join(__dirname, '/src/assets/icons/installer_icon.ico'),
        skipUpdateIcon: true,
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: path.join(__dirname, '/src/assets/icons/installer_icon.icns'),
      },
    },
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'electron/main.ts',
          config: 'vite.config.ts',
          target: 'main',
        },
        {
          entry: 'electron/preload.ts',
          config: 'vite.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
