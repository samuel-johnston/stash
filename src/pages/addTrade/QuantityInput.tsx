import { Control, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import RHFNumericTextField from '@components/RHFNumericTextField';

import { Schema } from './schema';
import RowInput from './RowInput';

const QuantityInput = ({ control }: { control: Control<Schema> }) => {
  const accountId = useWatch({ control, name: 'accountId' }) ?? '';
  const symbol = useWatch({ control, name: 'symbol' }) ?? '';
  const type = useWatch({ control, name: 'type' });

  const { data: availableUnits } = useQuery({
    queryKey: ['availableUnits', symbol, accountId, type],
    queryFn: async () => await window.electronAPI.availableUnits(symbol, accountId),
    enabled: symbol !== '' && accountId !== '' && type === 'SELL',
  });

  return (
    <RowInput
      label="Quantity"
      InputComponent={() => (
        <RHFNumericTextField<Schema>
          fullWidth
          size="small"
          name="quantity"
          control={control}
          allowNegative={false}
          endAdornment={availableUnits !== undefined ? `Owned: ${availableUnits}` : ''}
        />
      )}
    />
  );
};

export default QuantityInput;
