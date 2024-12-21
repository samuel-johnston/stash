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
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Material UI Icons
import AccountBalanceIcon from "@mui/icons-material/AccountBalanceRounded";
import NotificationsIcon from "@mui/icons-material/NotificationsRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AddchartIcon from "@mui/icons-material/AddchartRounded";
import NoteAddIcon from "@mui/icons-material/NoteAddRounded";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

interface MenuItemProps {
  title: string;
  to: string;
  icon: ReactNode;
}

interface Props {
  collapsed: boolean;
}

const Sidebar = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { collapsed } = props;
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
        marginTop: "64px",
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="space-between"
        pt="8px"
      >
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
