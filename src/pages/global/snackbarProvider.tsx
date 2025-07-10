import styled from '@emotion/styled';
import { ReactNode } from 'react';
import {
  closeSnackbar,
  MaterialDesignContent,
  SnackbarProvider,
} from 'notistack';

import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';

interface Props {
  children: ReactNode;
}

const Snackbar = ({ children }: Props) => {
  const { palette } = useTheme();

  const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
    '&.notistack-MuiContent-success': {
      backgroundColor: palette.success.main,
    },
    '&.notistack-MuiContent-error': {
      backgroundColor: palette.error.main,
    },
  }));

  return (
    <SnackbarProvider
      maxSnack={1}
      autoHideDuration={4000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionProps={{ direction: 'up' }}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
      }}
      action={(snackbarId) => (
        <Button onClick={() => closeSnackbar(snackbarId)} size="small" sx={{ minWidth: '20px' }}>
          <CloseIcon />
        </Button>
      )}
    >
      {children}
    </SnackbarProvider>
  );
};

export default Snackbar;
