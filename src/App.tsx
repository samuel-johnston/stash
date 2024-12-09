import { CssBaseline, Theme, ThemeProvider } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import { ColorModeContext, useMode } from "./theme";

// Fonts
import "non.geist";

// Pages
import Notifications from "./pages/notifications";
import AddCompany from "./pages/addCompany";
import Portfolio from "./pages/portfolio";
import AddTrade from "./pages/addTrade";
import Accounts from "./pages/accounts";
import Settings from "./pages/settings";

// Global components
import SnackbarProvider from "./pages/global/snackbarProvider";
import Sidebar from "./pages/global/sidebar";

type UseMode = [Theme, { toggleColorMode: () => void }];

function App() {
  const [theme, colorMode] = useMode() as UseMode;
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <CssBaseline />
          <div className="app">
            <Sidebar />
            <main className="content">
              <Routes>
                <Route path="/" element={<Navigate to="/portfolio" replace />} />
                <Route path="/addCompany" element={<AddCompany />} />
                <Route path="/addTrade" element={<AddTrade />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
