import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';

interface ErrorScreenProps {
  message: string;
}

const ErrorScreen = ({ message }: ErrorScreenProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="90%"
    >
      <ErrorRoundedIcon color="error" style={{ fontSize: 100 }} />
      <Typography variant="h4" color="primary" mt="20px">
        An error has occured
      </Typography>
      <Typography variant="h5" color="secondary" mt="12px">
        {message}
      </Typography>
    </Box>
  );
};

export default ErrorScreen;
