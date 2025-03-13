import { Box, Stack, Typography } from '@mui/material';
import { JSX } from 'react';

interface RowProps {
  label: string;
  InputComponent: () => JSX.Element;
}

const RowInput = ({ label, InputComponent }: RowProps) => (
  <Stack direction="row" alignItems="center">
    <Typography variant="h5" fontWeight={500} width="120px" minWidth="120px">
      {label}
    </Typography>
    <Box flexGrow={1} minWidth="140px">
      <InputComponent />
    </Box>
  </Stack>
);

export default RowInput;
