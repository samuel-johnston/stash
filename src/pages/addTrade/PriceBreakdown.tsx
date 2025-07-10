import { Control, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import { Schema } from './schema';

const RowItem = ({ label, subLabel, value }: { label: string; subLabel?: string; value: number }) => (
  <Box
    display="flex"
    flexDirection="row"
    justifyContent="space-between"
    mx="1px"
  >
    <Box>
      <Typography fontSize={15} display="inline">
        {label}
      </Typography>
      <Typography fontSize={15} display="inline" color="secondary">
        {subLabel ? ' ' + subLabel : ''}
      </Typography>
    </Box>
    <Typography fontSize={15}>
      {isNaN(value) ? '0.000' : value.toLocaleString('en-AU', { minimumFractionDigits: 3 })}
    </Typography>
  </Box>
);

const PriceBreakdown = ({ control }: { control: Control<Schema> }) => {
  const { palette } = useTheme();

  const { data: gstPercent = 0 } = useQuery({
    queryKey: ['gstPercent'],
    queryFn: async () => {
      const settings = await window.electronAPI.getData('settings');
      return settings.gstPercent;
    },
  });

  const brokerage = useWatch({ control, name: 'brokerage' }) ?? 0;
  const quantity = useWatch({ control, name: 'quantity' }) ?? 0;
  const price = useWatch({ control, name: 'price' }) ?? 0;
  const type = useWatch({ control, name: 'type' });

  const securityValue = quantity * price;
  const brokerageValue = brokerage * (type === 'BUY' ? 1 : -1);
  const gstValue = brokerageValue * gstPercent / 100;
  const totalValue = securityValue + brokerageValue + gstValue;

  return (
    <Stack
      divider={<Divider />}
      borderTop={`1px solid ${palette.grey[500]}`}
      borderBottom={`1px solid ${palette.grey[500]}`}
    >
      <Stack rowGap="14px" py="14px">
        <RowItem
          label="Value"
          value={securityValue}
        />
        <RowItem
          label="Brokerage"
          value={brokerageValue}
        />
        <RowItem
          label="GST"
          subLabel={`(${gstPercent}%)`}
          value={gstValue}
        />
      </Stack>
      <Stack rowGap="14px" py="14px">
        <RowItem
          label="Total"
          value={totalValue}
        />
      </Stack>
    </Stack>
  );
};

export default PriceBreakdown;
