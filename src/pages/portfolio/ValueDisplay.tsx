import Typography, { TypographyProps } from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { PortfolioData } from '@types';
import { numberFormat } from '@utils';

interface ValueDisplayProps {
  loading: boolean;
  data: PortfolioData | undefined;
}

interface LoadingTypography extends TypographyProps {
  loading: boolean;
  skeletonWidth: number;
}

const ValueDisplay = ({ loading, data }: ValueDisplayProps) => {
  const {
    marketValue = 0,
    todayChange = 0,
    todayChangePerc = null,
    profitOrLoss = 0,
    profitOrLossPerc = null,
    currency = 'AUD',
  } = data || {};

  return (
    <Stack direction="row" alignItems="flex-end" gap="30px" minWidth="400px">
      {/* Portfolio value container */}
      <Stack direction="column" gap="2px">
        <Typography variant="h6" fontWeight={400} color="secondary">
          Portfolio Value
        </Typography>
        <LoadingTypography
          loading={loading}
          skeletonWidth={200}
          variant="h1"
          fontWeight={600}
          fontSize={36}
        >
          {numberFormat('currency', marketValue, { decimals: 2, currency })}
        </LoadingTypography>
      </Stack>
      {/* Today's change container */}
      <Stack direction="column" gap="2px">
        <Typography variant="h6" fontWeight={400} color="secondary">
          Today's Change
        </Typography>
        <LoadingTypography
          loading={loading}
          skeletonWidth={120}
          variant="h6"
          fontWeight={700}
          color={getColor(todayChange)}
        >
          {numberFormat('decimal', todayChange, { decimals: 2, showTriangle: true }) + (todayChangePerc !== null ? ` (${numberFormat('percent', todayChangePerc, { decimals: 2 })})` : '')}
        </LoadingTypography>
      </Stack>
      {/* Total profit/loss container */}
      <Stack direction="column" gap="2px">
        <Typography variant="h6" fontWeight={400} color="secondary">
          Total Profit/Loss
        </Typography>
        <LoadingTypography
          loading={loading}
          skeletonWidth={120}
          variant="h6"
          fontWeight={700}
          color={getColor(profitOrLoss)}
        >
          {numberFormat('decimal', profitOrLoss, { decimals: 2, showTriangle: true }) + (profitOrLossPerc !== null ? ` (${numberFormat('percent', profitOrLossPerc, { decimals: 2 })})` : '')}
        </LoadingTypography>
      </Stack>
    </Stack>
  );
};

const getColor = (value: number): string => {
  if (value === 0) return 'primary';
  return (value > 0) ? 'success.main' : 'error.main';
};

const LoadingTypography = ({ loading, skeletonWidth, children, ...props }: LoadingTypography) => loading
  ? (
      <Skeleton
        width={skeletonWidth}
        animation="wave"
        sx={{ animationDuration: '0.8s' }}
      />
    )
  : (
      <Typography {...props}>
        {children}
      </Typography>
    );

export default ValueDisplay;
