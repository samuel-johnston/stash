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
  Key,
  Option,
  OptionKey,
  Settings,
} from "../types";

/**
 * Gets the data for a specific key from the storage file.
 *
 * @param key Provided key
 * @returns The data saved for the specific key
 */
export function getData(key: OptionKey): Promise<Option[]>;
export function getData(key: "countries"): Promise<Country[]>;
export function getData(key: "accounts"): Promise<Account[]>;
export function getData(key: "companies"): Promise<Company[]>;
export function getData(key: "historicals"): Promise<Historical[]>;
export function getData(key: "settings"): Promise<Settings>;
export async function getData(key: Key) {
  // Attempt to get data from storage
  let data = storage.getSync(key);

  // If data is empty (ie. data = {}), set data using default values
  if (data.constructor !== Array && Object.keys(data).length === 0) {
    const fileName = (app.isPackaged)
      ? path.join(process.resourcesPath, "data", `${key}.json`)
      : path.join(app.getAppPath(), "src", "assets", "data", `${key}.json`);

    if (fs.existsSync(fileName)) {
      // Read default values from file
      const datastr = fs.readFileSync(fileName);
      data = JSON.parse(String(datastr));
    }
    else {
      // Encase no file exists, set data to an empty array
      data = [];
      writeLog(`[getData]: Failed to read default values from [${fileName}]`);
    }

    // Save data to storage
    storage.set(key, data, (error) => {
      if (error) writeLog(`[setData]: ${error}`);
    });
  }

  return data;
}

/**
 * Saves the data for a specific key to the storage file.
 *
 * @param key Provided key
 * @param data The data to save
 */
export function setData(key: OptionKey, data: Option[]): Promise<void>;
export function setData(key: "countries", data: Country[]): Promise<void>;
export function setData(key: "accounts", data: Account[]): Promise<void>;
export function setData(key: "companies", data: Company[]): Promise<void>;
export function setData(key: "historicals", data: Historical[]): Promise<void>;
export function setData(key: "settings", data: Settings): Promise<void>;
export async function setData(key: Key, data: object) {
  storage.set(key, data, (error) => {
    if (error) writeLog(`[setData]: ${error}`);
  });
}

/**
 * Gets the path to the storage folder.
 *
 * @returns Full path to storage folder
 */
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
  return (app.isPackaged)
    ? app.getVersion()
    : process.env.npm_package_version;
};
