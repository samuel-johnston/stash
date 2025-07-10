import { useKBar } from 'kbar';

import { useColorScheme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SearchIcon from '@mui/icons-material/Search';

import { useSidebarContext } from '@contexts/SidebarContext';

const Topbar = () => {
  const { mode, setMode } = useColorScheme();
  const { palette } = useTheme();

  const { collapsed } = useSidebarContext();
  const sidebarWidth = collapsed ? 80 : 240;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="16px"
      component="header"
      position="fixed"
      left={`${sidebarWidth}px`}
      width={`calc(100% - ${sidebarWidth + 10}px)`}
      height="64.7px"
      pl="27px"
      pr="12px"
      sx={{
        zIndex: 1100,
        bgcolor: `${palette.grey[900]}${palette.mode === 'dark' ? 'cc' : '88'}`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${palette.grey[500]}`,
        transition: 'left 0.3s ease, width 0.3s ease',
      }}
    >
      <SearchBar />
      <Box display="flex" justifyContent="flex-end" columnGap="8px">
        <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
          {palette.mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

const SearchBar = () => {
  const { palette } = useTheme();
  const { query } = useKBar();

  const isMac = navigator.userAgent.toUpperCase().includes('MAC');

  return (
    <Button
      disableRipple
      color="secondary"
      onClick={() => query.toggle()}
      sx={{
        justifyContent: 'flex-start',
        height: '40px',
        width: '32vw',
        minWidth: '280px',
        padding: '6px 12px',
        borderRadius: '10px',
        bgcolor: palette.grey[800],
        border: `1px solid ${palette.grey[500]}88`,
        '&:hover': {
          cursor: 'text',
          bgcolor: palette.grey[700],
        },
        '&:focus-visible': {
          outline: '2px solid white',
          outlineOffset: '2px',
        },
      }}
    >
      <SearchIcon />
      <Box display="flex" alignItems="center" justifyContent="space-between" flexGrow={1}>
        <Typography fontSize="14px" align="left" ml="6px" mt="1px">
          Search your securities...
        </Typography>
        <Box display="flex" flexDirection="row" columnGap="6px">
          <Box
            borderRadius="4px"
            bgcolor={palette.grey[600]}
            p="2px 6px"
          >
            <Typography fontSize="12px">
              {isMac ? '⌘' : 'Ctrl'}
            </Typography>
          </Box>
          <Box
            borderRadius="4px"
            bgcolor={palette.grey[600]}
            p="2px 6px"
          >
            <Typography fontSize="12px">
              K
            </Typography>
          </Box>
        </Box>
      </Box>
    </Button>
  );
};

export default Topbar;
