import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  Action,
  createAction,
  ActionImpl,
  useRegisterActions,
} from "kbar";

// Material UI
import useTheme from "@mui/material/styles/useTheme";
import PersonIcon from "@mui/icons-material/Person";

// Helper files
import RenderResults from "./renderResults";

interface ProviderProps {
  children: ReactNode;
}

interface PositionerProps {
  loadActions: () => Promise<void>;
}

const Positioner = (props: PositionerProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { loadActions } = props;

  // Backdrop styles
  const positionerStyle = {
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 1300,
  };

  // Paper styles
  const animatorStyle = {
    maxWidth: "600px",
    width: "100%",
    background: colors.grey[900],
    borderRadius: "8px",
    border: `1px solid ${colors.grey[600]}`,
    overflow: "hidden",
  };

  // Search bar styles
  const searchStyle = {
    padding: "12px 16px",
    fontSize: "16px",
    width: "100%",
    outline: "none",
    border: "none",
    background: "transparent",
    color: colors.grey[100],
    fontFamily: "Geist Variable, Arial, sans-serif",
  };

  // Reload actions (triggered when kbar is opened)
  useEffect(() => {
    loadActions();
  }, []);

  return (
    <KBarPositioner style={positionerStyle}>
      <KBarAnimator style={animatorStyle}>
        <KBarSearch style={searchStyle} defaultPlaceholder="Search..." />
        <RenderResults />
      </KBarAnimator>
    </KBarPositioner>
  );
};

const Portal = () => {
  const navigate = useNavigate();
  const [actions, setActions] = useState<Action[]>([]);

  const loadActions = async () => {
    const [companies, accounts] = await Promise.all([
      window.electronAPI.getData("companies"),
      window.electronAPI.getData("accounts"),
    ]);

    const companyActions = companies.map((company) => createAction({
      section: "Companies",
      name: company.asxcode,
      subtitle: company.name,
      perform: (currentActionImpl: ActionImpl) => console.log(currentActionImpl.name),
    }));

    const accountActions = accounts.map((account) => createAction({
      section: "Accounts",
      name: account.name,
      icon: <PersonIcon />,
      perform: () => navigate("/accounts"),
    }));

    const newActions = [...companyActions, ...accountActions]
      .sort((a, b) => a.name.localeCompare(b.name));

    setActions(newActions);
  };

  // Initially load actions (only triggered once when app starts)
  useEffect(() => {
    loadActions();
  }, []);

  useRegisterActions(actions, [actions]);

  return (
    <KBarPortal>
      <Positioner loadActions={loadActions} />
    </KBarPortal>
  );
};

const Provider = (props: ProviderProps) => {
  const { children } = props;
  return (
    <KBarProvider>
      <Portal />
      {children}
    </KBarProvider>
  );
};

export default Provider;
