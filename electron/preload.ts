import { contextBridge, ipcRenderer } from 'electron';
import { Account, PortfolioFilterValues, SecurityOption } from './types';
import { Data, TradeData } from './api';

contextBridge.exposeInMainWorld('electronAPI', {
  // api/accounts.ts
  createAccount: (name: string) => ipcRenderer.invoke('createAccount', name),
  renameAccount: (account: Account) => ipcRenderer.invoke('renameAccount', account),
  deleteAccount: (accountId: string) => ipcRenderer.invoke('deleteAccount', accountId),
  getAccountData: () => ipcRenderer.invoke('getAccountData'),

  // api/portfolio.ts
  getPortfolioData: (values: PortfolioFilterValues) => ipcRenderer.invoke('getPortfolioData', values),

  // api/securities.ts
  searchSecurities: (query: string) => ipcRenderer.invoke('searchSecurities', query),
  getAddSecurityData: () => ipcRenderer.invoke('getAddSecurityData'),
  addSecurity: (data: SecurityOption) => ipcRenderer.invoke('addSecurity', data),

  // api/storage.ts
  reloadData: () => ipcRenderer.invoke('reloadData'),
  getData: (key: keyof Omit<Data, 'historicals' | 'exchangeRates'>) => ipcRenderer.invoke('getData', key),
  setData: (key: keyof Data, data: object) => ipcRenderer.invoke('setData', key, data),
  getStoragePath: () => ipcRenderer.invoke('getStoragePath'),
  openStoragePath: () => ipcRenderer.invoke('openStoragePath'),
  getVersion: () => ipcRenderer.invoke('getVersion'),
  getHistoricalData: (symbols: string[]) => ipcRenderer.invoke('getHistoricalData', symbols),
  getExchangeRateData: (currencies: string[]) => ipcRenderer.invoke('getExchangeRateData', currencies),

  // api/trades.ts
  lastPrice: (symbol: string) => ipcRenderer.invoke('lastPrice', symbol),
  availableUnits: (symbol: string, accountId: string) => ipcRenderer.invoke('availableUnits', symbol, accountId),
  addTrade: (data: TradeData) => ipcRenderer.invoke('addTrade', data),
});
