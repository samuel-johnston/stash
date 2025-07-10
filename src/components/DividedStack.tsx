import Stack, { StackProps } from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';

const DividedStack = ({ children, ...props }: Omit<StackProps, 'divider'>) => {
  const { palette } = useTheme();

  const StyledDivider = () => <Divider sx={{ borderColor: palette.grey[800] }} />;

  return (
    <>
      <StyledDivider />
      <Stack {...props} divider={<StyledDivider />}>
        {children}
      </Stack>
      <StyledDivider />
    </>
  );
};

export default DividedStack;
