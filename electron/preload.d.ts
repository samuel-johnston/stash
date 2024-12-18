import * as api from "./api";

declare global {
  interface Window {
    electronAPI: typeof api;
  }
}
