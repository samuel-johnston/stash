import styled from "@emotion/styled";
import { ReactNode } from "react";
import {
  closeSnackbar,
  MaterialDesignContent,
  SnackbarProvider as NotistackSnackBarProvider,
} from "notistack";

// Material UI
import useTheme from "@mui/material/styles/useTheme";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";

interface Props {
  children: ReactNode;
}

const SnackbarProvider = ({ children }: Props) => {
  const theme = useTheme();

  const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
    "&.notistack-MuiContent-success": {
      backgroundColor: theme.palette.success.main,
    },
    "&.notistack-MuiContent-error": {
      backgroundColor: theme.palette.error.main,
    },
  }));

  return (
    <NotistackSnackBarProvider
      maxSnack={1}
      autoHideDuration={3500}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      TransitionProps={{ direction: "down" }}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
      }}
      action={(snackbarId) => (
        <Button onClick={() => closeSnackbar(snackbarId)} size="small" sx={{ minWidth: "20px" }}>
          <CloseIcon />
        </Button>
      )}
    >
      {children}
    </NotistackSnackBarProvider>
  );
};

export default SnackbarProvider;
