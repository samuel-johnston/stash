import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const LoadingScreen = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="90%">
      <CircularProgress size="65px" />
    </Box>
  );
};

export default LoadingScreen;
