import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';

import useTheme from '@mui/material/styles/useTheme';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import RHFNumericTextField from '@components/RHFNumericTextField';
import Header from '@components/Header';

import useStoragePath from '@queries/useStoragePath';
import useSettings from '@queries/useSettings';

import { Settings } from '@types';

import { Schema, schema, defaultValues } from './schema';
import RowLabel from './RowLabel';
import Row from './Row';
import RHFTextField from '@components/RHFTextField';

const Settings = () => {
  const { palette } = useTheme();
  const queryClient = useQueryClient();

  const { data: storagePath, isLoading: storagePathLoading } = useStoragePath();
  const { data: settings } = useSettings();

  const { control, handleSubmit } = useForm<Schema>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
    values: settings,
  });

  const { mutateAsync: saveSettings } = useMutation({
    mutationFn: async (values: Schema) => window.electronAPI.setData('settings', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const onSubmit = async (values: Schema) => {
    await saveSettings(values);
    enqueueSnackbar('Successfully saved!', { variant: 'success' });
  };

  const StyledDivider = () => <Divider sx={{ borderColor: palette.grey[800] }} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Header title="Settings" subtitle="Manage application settings" />
      <StyledDivider />
      <Stack divider={<StyledDivider />}>
        <Row>
          <RowLabel
            title="Storage Location"
            subtitle={storagePath}
            loading={storagePathLoading}
            skeletonWidth={440}
          />
          <Button
            variant="outlined"
            onClick={window.electronAPI.openStoragePath}
            sx={{ width: 130 }}
          >
            Open Location
          </Button>
        </Row>
        <Row>
          <RowLabel
            title="Currency"
            subtitle="Show prices and values using this currency"
          />
          <RHFTextField<Schema>
            name="currency"
            control={control}
            size="small"
            sx={{ width: 130 }}
            slotProps={{
              htmlInput: {
                style: {
                  textTransform: 'uppercase',
                },
              },
            }}
          />
        </Row>
        <Row>
          <RowLabel
            title="GST Percentage"
            subtitle="% of brokerage used to calculate GST"
          />
          <RHFNumericTextField<Schema>
            name="gstPercent"
            control={control}
            size="small"
            endAdornment="%"
            allowNegative={false}
            sx={{ width: 130 }}
          />
        </Row>
        <Row>
          <RowLabel
            title="Brokerage Auto Fill"
            subtitle="Automatically prefill trades with this brokerage"
          />
          <RHFNumericTextField<Schema>
            name="brokerageAutoFill"
            control={control}
            size="small"
            startAdornment="$"
            allowNegative={false}
            sx={{ width: 130 }}
          />
        </Row>
      </Stack>
      <StyledDivider />
      <Box display="flex" justifyContent="end" mt="30px">
        <Button type="submit" variant="contained" sx={{ width: 130 }}>
          Save Changes
        </Button>
      </Box>
    </form>
  );
};

export default Settings;
