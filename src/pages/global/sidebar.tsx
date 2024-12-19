import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import {
  Menu,
  menuClasses,
  MenuItemStyles,
  MenuItem as ProMenuItem,
  Sidebar as ProSidebar,
} from "react-pro-sidebar";

// Material UI
import useTheme from "@mui/material/styles/useTheme";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

// Material UI Icons
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import AccountBalanceIcon from "@mui/icons-material/AccountBalanceRounded";
import NotificationsIcon from "@mui/icons-material/NotificationsRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AddchartIcon from "@mui/icons-material/AddchartRounded";
import NoteAddIcon from "@mui/icons-material/NoteAddRounded";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

// Custom Logo Icon
import LogoIcon from "../../assets/logo.svg";

interface MenuItemProps {
  title: string;
  to: string;
  icon: ReactNode;
}

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>("Portfolio");
  const [version, setVersion] = useState<string>("");

  // On page render, get application version from API
  useEffect(() => {
    (async () => {
      setVersion(await window.electronAPI.getVersion());
    })();
  }, []);

  /**
   * A helper function for creating menu items.
   */
  const MenuItem = (props: MenuItemProps) => {
    const { title, to, icon } = props;
    return (
      <ProMenuItem
        icon={icon}
        active={selected === title}
        onClick={() => setSelected(title)}
        component={<Link to={to} />}
      >
        <Typography fontSize={16}>{title}</Typography>
      </ProMenuItem>
    );
  };

  const menuItemStyles: MenuItemStyles = {
    button: {
      height: "42px",
      padding: "0px 10px 0px 12px",
      margin: "4px 10px 4px 10px",
      borderRadius: "8px",
      "&:hover": {
        backgroundColor: colors.grey[700],
      },
      [`&.${menuClasses.active}`]: {
        backgroundColor: colors.grey[600],
      },
    },
  };

  return (
    <ProSidebar
      collapsed={collapsed}
      backgroundColor={colors.grey[900]}
      width="240px"
      rootStyles={{
        borderColor: colors.grey[500],
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="space-between"
      >
        {/* Header and content container */}
        <Box>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" height="90px">
            {/* Hide logo when collapsed */}
            {!collapsed
              ? (
                  <Box display="flex" alignItems="center" ml="28px">
                    <LogoIcon style={{ width: "32px", height: "32px", marginRight: "10px", flexShrink: 0 }} />
                    <Typography variant="h2" fontWeight={500} color={colors.grey[100]}>
                      Stash
                    </Typography>
                  </Box>
                )
              : <Box></Box>}
            {/* Open/close sidebar */}
            <IconButton disableTouchRipple onClick={() => setCollapsed(!collapsed)} sx={{ mr: "20px" }}>
              {collapsed ? <KeyboardDoubleArrowRightIcon /> : <KeyboardDoubleArrowLeftIcon />}
            </IconButton>
          </Box>
          {/* Divider between header and content */}
          <Divider sx={{ mb: "10px" }} />
          {/* Content */}
          <Box display="flex" flexDirection="column" justifyContent="space-between">
            <Menu menuItemStyles={menuItemStyles}>
              <MenuItem
                title="Portfolio"
                to="/portfolio"
                icon={<AccountBalanceIcon />}
              />
              <MenuItem
                title="Accounts"
                to="/accounts"
                icon={<PeopleAltIcon />}
              />
              <MenuItem
                title="Notifications"
                to="/notifications"
                icon={<NotificationsIcon />}
              />
              <MenuItem
                title="Add Company"
                to="/addCompany"
                icon={<NoteAddIcon />}
              />
              <MenuItem
                title="Add Trade"
                to="/addTrade"
                icon={<AddchartIcon />}
              />
            </Menu>
          </Box>
        </Box>
        {/* Footer */}
        <Box mb="5px">
          <Typography color="secondary" align="center" width="79px">
            {"v" + version}
          </Typography>
          <Menu menuItemStyles={menuItemStyles}>
            <MenuItem
              title="Settings"
              to="/settings"
              icon={<SettingsOutlinedIcon />}
            />
          </Menu>
        </Box>
      </Box>
    </ProSidebar>
  );
};

export default Sidebar;
