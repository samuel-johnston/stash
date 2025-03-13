import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  menuClasses,
  MenuItemStyles,
  MenuItem as ProMenuItem,
  Sidebar as ProSidebar,
} from 'react-pro-sidebar';

import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import AddTradeIcon from '@mui/icons-material/AddchartRounded';
import AccountsIcon from '@mui/icons-material/PeopleAlt';
import PortfolioIcon from '@mui/icons-material/Timeline';
import StartIcon from '@mui/icons-material/Start';

import { ReactComponent as LogoIcon } from '@assets/icons/icon.svg';
import { useSidebarContext } from '@contexts/SidebarContext';

interface MenuItemProps {
  title: string;
  to: string;
  icon: ReactNode;
}

const Sidebar = () => {
  const location = useLocation();
  const { palette } = useTheme();
  const { collapsed, toggleSidebar } = useSidebarContext();
  const [version, setVersion] = useState<string>('');

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
        active={location.pathname.includes(to)}
        component={<Link to={to} />}
      >
        <Typography fontSize={16}>{title}</Typography>
      </ProMenuItem>
    );
  };

  const menuItemStyles: MenuItemStyles = {
    button: {
      height: '38px',
      padding: '0px 10px 0px 12px',
      margin: '6px 10px 6px 10px',
      borderRadius: '8px',
      '&:hover': {
        backgroundColor: palette.grey[700],
      },
      [`&.${menuClasses.active}`]: {
        backgroundColor: palette.grey[600],
      },
    },
  };

  return (
    <ProSidebar
      collapsed={collapsed}
      backgroundColor={palette.grey[900]}
      width="240px"
      rootStyles={{
        borderColor: palette.grey[500],
      }}
    >
      <Stack
        justifyContent="space-between"
        height="100%"
      >
        <Stack divider={<Divider />}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" height="64px" ml="20px">
            {/* Hide logo when collapsed */}
            {!collapsed
              ? (
                  <Box display="flex" alignItems="center" gap="10px" ml="4px">
                    <LogoIcon style={{ width: '30px', height: '30px' }} />
                    <Typography variant="h3" fontWeight={500} color="primary">
                      Stash
                    </Typography>
                  </Box>
                )
              : <></>}
            {/* Open/collapse sidebar */}
            <IconButton disableTouchRipple onClick={() => toggleSidebar()} sx={{ mr: '20px' }}>
              <StartIcon style={{ transform: `rotate(${collapsed ? 0 : 180}deg)` }} />
            </IconButton>
          </Box>
          {/* Content */}
          <Stack mt="6px">
            <Menu menuItemStyles={menuItemStyles}>
              <MenuItem
                title="Portfolio"
                to="/portfolio"
                icon={<PortfolioIcon />}
              />
              <MenuItem
                title="Accounts"
                to="/accounts"
                icon={<AccountsIcon />}
              />
              <MenuItem
                title="Add Trade"
                to="/trading/add"
                icon={<AddTradeIcon />}
              />
            </Menu>
          </Stack>
        </Stack>
        {/* Footer */}
        <Box mb="5px">
          <Typography color="secondary" align="center" width="79px">
            {'v' + version}
          </Typography>
          <Menu menuItemStyles={menuItemStyles}>
            <MenuItem
              title="Settings"
              to="/settings"
              icon={<SettingsIcon />}
            />
          </Menu>
        </Box>
      </Stack>
    </ProSidebar>
  );
};

export default Sidebar;
