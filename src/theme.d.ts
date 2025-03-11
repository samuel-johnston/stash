import { Palette, PaletteOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    blueAccent: Palette['primary'];
  }

  interface PaletteOptions {
    blueAccent?: PaletteOptions['primary'];
  }

  interface PaletteColor {
    [key: number]: string;
  }
}
