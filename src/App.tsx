import { Routes, Route, Navigate } from 'react-router-dom';

import 'non.geist';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';

import { SidebarContextProvider } from '@contexts/SidebarContext';

import SnackbarProvider from '@pages/global/SnackbarProvider';
import KBarProvider from '@pages/global/kbarProvider';
import Sidebar from '@pages/global/Sidebar';
import Topbar from '@pages/global/Topbar';

import Portfolio from '@pages/portfolio';
import AddTrade from '@pages/addTrade';
import Accounts from '@pages/accounts';
import Settings from '@pages/settings';

import theme from './theme';

const App = () => {
  return (
    <ThemeProvider theme={theme} noSsr disableTransitionOnChange defaultMode="dark">
      <SnackbarProvider>
        <KBarProvider>
          <SidebarContextProvider>
            <CssBaseline />
            <div className="app">
              <Sidebar />
              <Topbar />
              <Stack width="100%" sx={{ scrollbarGutter: 'stable', overflowY: 'auto' }}>
                <main className="content">
                  <Routes>
                    <Route path="/" element={<Navigate to="/portfolio" replace />} />
                    <Route path="/trading/add" element={<AddTrade />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </Stack>
            </div>
          </SidebarContextProvider>
        </KBarProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
