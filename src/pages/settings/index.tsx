import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

import useTheme from '@mui/material/styles/useTheme';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import RHFNumericTextField from '@components/RHFNumericTextField';
import RHFTextField from '@components/RHFTextField';
import DividedStack from '@components/DividedStack';
import { createTabs } from '@components/Tabs';
import Header from '@components/Header';

import useStoragePath from '@queries/useStoragePath';
import useSettings from '@queries/useSettings';

import { Settings } from '@types';

import { Schema, schema, defaultValues } from './schema';
import RowLabel from './RowLabel';
import Row from './Row';

type TabValues = 'general' | 'storage';

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

  const [tabValue, setTabValue] = useState<TabValues>('general');
  const Tabs = createTabs<TabValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Header title="Settings" subtitle="Manage application settings and preferences" />
      <Tabs value={tabValue} setValue={setTabValue} mt="-6px">
        <Tabs.List mb="24px">
          <Tabs.Trigger value="general">General</Tabs.Trigger>
          <Tabs.Trigger value="storage">Storage</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="general">
          <DividedStack>
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
          </DividedStack>
        </Tabs.Content>
        <Tabs.Content value="storage">
          <DividedStack>
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
                sx={{
                  width: 130,
                  borderColor: palette.grey[500],
                  '&:hover': {
                    borderColor: palette.grey[100],
                  },
                }}
              >
                Open Location
              </Button>
            </Row>
          </DividedStack>
        </Tabs.Content>
      </Tabs>
      <Box display="flex" justifyContent="end" mt="30px">
        <Button type="submit" variant="contained" sx={{ width: 130 }}>
          Save Changes
        </Button>
      </Box>
    </form>
  );
};

export default Settings;
