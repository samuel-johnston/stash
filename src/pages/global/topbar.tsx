import { Dispatch, SetStateAction } from "react";
import { tokens } from "../../theme";

// Material UI
import useTheme from "@mui/material/styles/useTheme";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

// Icons
import CollapseSidebarIcon from "@mui/icons-material/MenuOpen";
import ExpandSidebarIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import LogoIcon from "../../assets/icons/icon.svg";
import { useKBar } from "kbar";

interface Props {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

const Topbar = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { collapsed, setCollapsed } = props;

  return (
    <AppBar
      elevation={0}
      sx={{
        bgcolor: `${colors.grey[900]}cc`,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${colors.grey[500]}`,
      }}
    >
      <Toolbar disableGutters>
        <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ mx: "21px" }}>
          {!collapsed ? <CollapseSidebarIcon /> : <ExpandSidebarIcon />}
        </IconButton>
        <LogoIcon style={{ width: "30px", height: "30px" }} />
        <Typography variant="h3" fontWeight={500} color="primary" ml="12px">
          Stash
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <SearchBar />
      </Toolbar>
    </AppBar>
  );
};

const SearchBar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { query } = useKBar();
  const isMac = navigator.userAgent.toUpperCase().includes("MAC");

  return (
    <Button
      disableTouchRipple
      color="secondary"
      onClick={() => query.toggle()}
      sx={{
        mr: "14px",
        width: "220px",
        padding: "6px 12px",
        borderRadius: "8px",
        border: `1px solid ${colors.grey[500]}`,
      }}
    >
      <SearchIcon />
      <Typography
        fontSize="14px"
        align="left"
        ml="6px"
      >
        Search...
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Typography
        fontSize="12px"
      >
        {isMac ? "⌘ + K" : "Ctrl + K"}
      </Typography>
    </Button>
  );
};

export default Topbar;
