import styled from "@emotion/styled";
import { ReactNode } from "react";
import {
  closeSnackbar,
  MaterialDesignContent,
  SnackbarProvider,
} from "notistack";

// Material UI
import useTheme from "@mui/material/styles/useTheme";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";

interface Props {
  children: ReactNode;
}

const Snackbar = ({ children }: Props) => {
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
    <SnackbarProvider
      maxSnack={1}
      autoHideDuration={3500}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      TransitionProps={{ direction: "up" }}
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
    </SnackbarProvider>
  );
};

export default Snackbar;
