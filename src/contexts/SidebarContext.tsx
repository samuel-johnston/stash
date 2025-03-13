import { createContext, ReactNode, useContext, useState } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarContextProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed((prev) => !prev);
  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarContextProvider');
  }
  return context;
};
