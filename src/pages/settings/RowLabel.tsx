import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

interface RowLabelProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  skeletonWidth?: number;
}

const RowLabel = ({ title, subtitle, loading, skeletonWidth }: RowLabelProps) => {
  return (
    <Box>
      <Typography variant="h5" fontWeight={400} color="primary">
        {title}
      </Typography>
      <Typography variant="h6" fontWeight={400} color="secondary">
        {loading
          ? (
              <Skeleton
                width={skeletonWidth ?? 100}
                animation="wave"
                sx={{ animationDuration: '0.8s' }}
              />
            )
          : subtitle}
      </Typography>
    </Box>
  );
};

export default RowLabel;
