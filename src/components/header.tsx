import { Typography, Box } from '@mui/material';

const Header = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <Box mb="30px">
    <Typography
      variant="h2"
      fontWeight={600}
      color="primary"
      sx={{
        mb: '5px',
      }}
    >
      {title}
    </Typography>
    <Typography variant="h5" color="secondary">
      {subtitle}
    </Typography>
  </Box>
);

export default Header;
