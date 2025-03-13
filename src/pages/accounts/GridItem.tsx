import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';

import { numberFormat } from '@utils';

type Order = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

interface GridItemProps {
  label: string;
  value: number;
  /**
   * Style to disaply value. Default = "decimal"
   */
  style?: 'decimal' | 'currency';
  /**
   * Which currency to use? (only applied when `style="currency"`)
   */
  currency?: string;
  /**
   * Percentage value?
   */
  percent?: number;
  /**
   * Show up/down triange before value?
   */
  showTriangle?: boolean;
  order: Order;
}

const GridItem = ({
  label,
  value: numberValue,
  style = 'decimal',
  currency,
  percent,
  showTriangle = false,
  order,
}: GridItemProps) => {
  const { palette } = useTheme();

  const value = numberValue || null;
  const textColor = style === 'decimal' ? getColor(value) : 'primary';

  let result = numberFormat(style, value, { decimals: 2, showTriangle, currency });
  if (percent !== undefined) {
    result += ` (${numberFormat('percent', percent, { decimals: 2 })})`;
  }

  return (
    <Grid size={6} order={order}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
        borderBottom={`1px solid ${palette.grey[800]}`}
        px="2px"
      >
        <Typography fontSize={14}>
          {label}
        </Typography>
        <Typography
          fontSize={14}
          fontWeight={textColor === 'primary' ? 400 : 700}
          color={textColor}
        >
          {result}
        </Typography>
      </Box>
    </Grid>
  );
};

const getColor = (value: number | null): string => {
  if (value === null || value === 0) return 'primary';
  return (value > 0) ? 'success.main' : 'error.main';
};

export default GridItem;
