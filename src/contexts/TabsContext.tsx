import { createContext, ReactNode, useContext, useState } from 'react';

interface TabsContextType<T extends string> {
  tabValue: T;
  setTabValue: (value: T) => void;
};

interface TabsContextProviderProps<T extends string> {
  defaultValue: T;
  children?: ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TabsContext = createContext<TabsContextType<any> | undefined>(undefined);

export const TabsContextProvider = <T extends string>({ defaultValue, children }: TabsContextProviderProps<T>) => {
  const [tabValue, setTabValue] = useState<T>(defaultValue);
  return (
    <TabsContext.Provider value={{ tabValue, setTabValue }}>
      {children}
    </TabsContext.Provider>
  );
};

export const useTabsContext = <T extends string>() => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within a TabsContextProvider');
  }
  return context as TabsContextType<T>;
};
