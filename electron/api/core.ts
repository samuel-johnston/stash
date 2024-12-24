import storage from "electron-json-storage";
import { app, shell } from "electron";
import { writeLog } from "../utils";
import path from "path";
import fs from "fs";

// Types
import {
  Account,
  Company,
  Country,
  Historical,
  Option,
  Settings,
} from "../types";

type DataMap = {
  financialStatus: Option[];
  miningStatus: Option[];
  monitor: Option[];
  products: Option[];
  recommendations: Option[];
  resources: Option[];
  countries: Country[];
  accounts: Account[];
  companies: Company[];
  historicals: Historical[];
  settings: Settings;
};

const dataStore: Partial<DataMap> = {};

/**
 * Gets the data for a specific key from the storage file.
 *
 * @param key Provided key
 * @returns The data saved for the specific key
 */
export const getData = async <K extends keyof DataMap>(key: K): Promise<DataMap[K]> => {
  if (key in dataStore) {
    return dataStore[key] as DataMap[K];
  }

  // If the key is not in the dataStore, we need to read it from storage (a JSON file)
  let data = storage.getSync(key);

  // If storage is empty, try to set using the backup JSON file
  if (!Array.isArray(data) && Object.keys(data).length === 0) {
    const fileName = app.isPackaged
      ? path.join(process.resourcesPath, "data", `${key}.json`)
      : path.join(app.getAppPath(), "src", "assets", "data", `${key}.json`);

    if (fs.existsSync(fileName)) {
      const datastr = fs.readFileSync(fileName);
      data = JSON.parse(String(datastr));
    }
    else {
      // In case the backup JSON file could not be read
      data = (key === "settings") ? {} : [];
      writeLog(`[getData]: Could not read default values from [${fileName}]`);
    }

    // Save data to storage
    storage.set(key, data, (error) => {
      if (error) writeLog(`[setData]: ${error}`);
    });
  }

  dataStore[key] = data as DataMap[K];
  return data as DataMap[K];
};

/**
 * Saves the data for a specific key to the storage file.
 *
 * @param key Provided key
 * @param data The data to save
 */
export const setData = async <K extends keyof DataMap>(key: K, data: DataMap[K]) => {
  dataStore[key] = data;
  storage.set(key, data, (error) => {
    if (error) writeLog(`[setData]: ${error}`);
  });
};

/**
 * Gets the full path to the storage folder.
 * */
export const getStoragePath = async () => {
  return storage.getDataPath();
};

/**
 * Opens the storage folder in a new window.
 */
export const openStoragePath = async () => {
  shell.openPath(storage.getDataPath());
};

/**
 * Gets the version of the application from `package.json`.
 */
export const getVersion = async () => {
  return app.isPackaged ? app.getVersion() : process.env.npm_package_version;
};
