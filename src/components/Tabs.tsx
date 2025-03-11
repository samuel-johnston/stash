import { TabsContextProvider, useTabsContext } from '@contexts/TabsContext';
import Button, { ButtonProps } from '@mui/material/Button';
import Stack, { StackProps } from '@mui/material/Stack';
import Box, { BoxProps } from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

interface TabsListProps extends StackProps { };

const createTabsList = () => ({ children, ...props }: TabsListProps) => (
  <Stack role="tablist" direction="row" columnGap="10px" {...props}>
    {children}
  </Stack>
);

interface TabsTriggerProps<T extends string> extends ButtonProps {
  value: T;
};

const createTabsTrigger = <T extends string>() => ({ children, value, sx, ...props }: TabsTriggerProps<T>) => {
  const { tabValue, setTabValue } = useTabsContext<T>();
  const { palette } = useTheme();
  return (
    <Button
      disableRipple
      variant="contained"
      role="tab"
      id={`tab-${value}`}
      onClick={() => setTabValue(value)}
      sx={{
        borderRadius: '24px',
        color: tabValue === value ? palette.grey[900] : palette.grey[100],
        bgcolor: tabValue === value ? palette.grey[100] : palette.grey[600],
        '&:hover': {
          bgcolor: tabValue === value ? palette.grey[100] : palette.grey[500],
        },
        cursor: tabValue === value ? 'default' : 'pointer',
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

interface TabsContentProps<T extends string> extends BoxProps {
  value: T;
};

const createTabsContent = <T extends string>() => ({ children, value, ...props }: TabsContentProps<T>) => {
  const { tabValue } = useTabsContext<T>();
  return (
    <Box
      role="tabpanel"
      hidden={tabValue !== value}
      id={`tabpanel-${value}`}
      {...props}
    >
      {tabValue === value && children}
    </Box>
  );
};

interface TabsProps<T extends string> extends BoxProps {
  defaultValue: T;
  children: ReactNode;
}

export const createTabs = <T extends string>() => {
  const Tabs = ({ defaultValue, children, ...props }: TabsProps<T>) => (
    <TabsContextProvider<T> defaultValue={defaultValue}>
      <Box {...props}>
        {children}
      </Box>
    </TabsContextProvider>
  );

  Tabs.List = createTabsList();
  Tabs.Trigger = createTabsTrigger<T>();
  Tabs.Content = createTabsContent<T>();

  return Tabs;
};
