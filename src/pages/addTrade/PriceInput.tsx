import { Control, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import RHFNumericTextField from '@components/RHFNumericTextField';

import { Schema } from './schema';
import RowInput from './RowInput';

const PriceInput = ({ control }: { control: Control<Schema> }) => {
  const symbol = useWatch({ control, name: 'symbol' }) ?? '';

  const { data: lastPrice } = useQuery({
    queryKey: ['lastPrice', symbol],
    queryFn: async () => await window.electronAPI.lastPrice(symbol),
    enabled: symbol !== '',
  });

  const lastPriceStr = lastPrice !== undefined
    ? `Last: ${Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(
      lastPrice,
    )}`
    : '';

  return (
    <RowInput
      label="Price"
      InputComponent={() => (
        <RHFNumericTextField<Schema>
          fullWidth
          size="small"
          name="price"
          control={control}
          allowNegative={false}
          startAdornment="$"
          endAdornment={lastPriceStr}
        />
      )}
    />
  );
};

export default PriceInput;
