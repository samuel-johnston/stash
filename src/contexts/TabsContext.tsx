import { createContext, useContext } from 'react';

interface TabsContextType<T extends string> {
  tabValue: T;
  setTabValue: (value: T) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TabsContext = createContext<TabsContextType<any> | undefined>(undefined);

export const useTabsContext = <T extends string>() => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within a TabsContextProvider');
  }
  return context as TabsContextType<T>;
};
