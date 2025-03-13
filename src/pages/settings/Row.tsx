import { ReactNode } from 'react';

import Stack from '@mui/material/Stack';

interface RowProps {
  children: ReactNode;
}

const Row = ({ children }: RowProps) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      my="18px"
    >
      {children}
    </Stack>
  );
};

export default Row;
