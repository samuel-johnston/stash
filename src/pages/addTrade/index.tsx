import { Location, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import RHFNumericTextField from '@components/RHFNumericTextField';
import RHFDatePicker from '@components/RHFDatePicker';
import RHFSelect from '@components/RHFSelect';
import Header from '@components/Header';

import useSecurityOptions from '@queries/useSecurityOptions';
import useAccountOptions from '@queries/useAccountOptions';

import { dayjsStringify } from '@utils';

import { Schema, schema, defaultValues } from './schema';
import PriceBreakdown from './PriceBreakdown';
import QuantityInput from './QuantityInput';
import PriceInput from './PriceInput';
import TypeButton from './TypeButton';
import RowInput from './RowInput';

const AddTrade = () => {
  const { palette } = useTheme();

  const location = useLocation() as Location<{ symbol: string }>;
  const { symbol } = location.state || {};

  const { control, handleSubmit, trigger, getValues, setValue } = useForm<Schema>({
    mode: 'all',
    criteriaMode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      symbol: symbol ?? '',
    },
  });

  const triggerQuantityValidation = () => {
    if (getValues('quantity') !== undefined) {
      trigger('quantity');
    }
  };

  const { data: securityOptions } = useSecurityOptions();
  const { data: accountOptions } = useAccountOptions();

  useEffect(() => {
    (async () => {
      const settings = await window.electronAPI.getData('settings');
      if (settings.brokerageAutoFill !== undefined) {
        setValue('brokerage', settings.brokerageAutoFill);
      }
    })();
  }, []);

  const onSubmit = async (values: Schema) => {
    // Convert Dayjs objects to strings (can't send Dayjs types over IPC)
    const sendValues = { ...values, date: dayjsStringify(values.date) };
    await window.electronAPI.addTrade(sendValues);
    enqueueSnackbar(`Trade successfully added!`, { variant: 'success' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Header title="Add Trade" subtitle="Record a trade for a security" />
      <Grid container columns={12} spacing={{ xs: 4, md: 6 }}>
        <Grid
          size={{ xs: 12, md: 7 }}
          border={`1px solid ${palette.grey[500]}`}
          borderRadius="10px"
          p="30px"
        >
          <Stack rowGap="32px">
            <RowInput
              label="Security"
              InputComponent={() => (
                <RHFSelect<Schema>
                  name="symbol"
                  control={control}
                  options={securityOptions}
                  onChange={triggerQuantityValidation}
                />
              )}
            />
            <RowInput
              label="Account"
              InputComponent={() => (
                <RHFSelect<Schema>
                  name="accountId"
                  control={control}
                  options={accountOptions}
                  onChange={triggerQuantityValidation}
                />
              )}
            />
            <RowInput
              label="Type"
              InputComponent={() => (
                <Box display="flex" flexDirection="row" justifyContent="space-between" columnGap="24px">
                  <TypeButton<Schema>
                    name="type"
                    control={control}
                    value="BUY"
                    onChange={triggerQuantityValidation}
                  />
                  <TypeButton<Schema>
                    name="type"
                    control={control}
                    value="SELL"
                    onChange={triggerQuantityValidation}
                  />
                </Box>
              )}
            />
            <RowInput
              label="Date"
              InputComponent={() => (
                <RHFDatePicker<Schema>
                  disableFuture
                  name="date"
                  control={control}
                />
              )}
            />
            <QuantityInput control={control} />
            <PriceInput control={control} />
            <RowInput
              label="Brokerage"
              InputComponent={() => (
                <RHFNumericTextField<Schema>
                  fullWidth
                  size="small"
                  name="brokerage"
                  control={control}
                  allowNegative={false}
                  startAdornment="$"
                />
              )}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }} mb="24px">
          <Stack
            rowGap="20px"
            border={`1px solid ${palette.grey[500]}`}
            borderRadius="10px"
            p="30px"
          >
            <Typography variant="h4" fontWeight={400}>
              Details
            </Typography>
            <PriceBreakdown control={control} />
            <Button type="submit" variant="contained" sx={{ mt: '6px' }}>
              Confirm
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

export default AddTrade;
