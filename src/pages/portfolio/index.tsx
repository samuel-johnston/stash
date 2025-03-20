import { useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { RefObject, useState } from 'react';

import { GridApi, useGridApiRef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';

import { createTabs } from '@components/Tabs';
import RHFSelect from '@components/RHFSelect';
import AreaChart from '@components/AreaChart';

import useAccountOptions from '@queries/useAccountOptions';
import useOptions from '@queries/useOptions';

import { Schema, schema, defaultValues } from './schema';
import SellHistoryTable from './SellHistoryTable';
import BuyHistoryTable from './BuyHistoryTable';
import HoldingsTable from './HoldingsTable';
import ValueDisplay from './ValueDisplay';
import TableActions from './TableActions';
import TradesTable from './TradesTable';

export type TabValues = 'holdings' | 'trades' | 'buyHistory' | 'sellHistory';

const Portfolio = () => {
  const queryClient = useQueryClient();

  const apiRefs: Record<TabValues, RefObject<GridApi>> = {
    holdings: useGridApiRef(),
    trades: useGridApiRef(),
    buyHistory: useGridApiRef(),
    sellHistory: useGridApiRef(),
  };

  const { data: options } = useOptions();
  const { data: accountOptions } = useAccountOptions({ allAccountsOption: true });

  const { control, getValues, watch } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ['portfolioData'],
    queryFn: async () => window.electronAPI.getPortfolioData(getValues()),
  });

  const [tabValue, setTabValue] = useState<TabValues>('holdings');
  const Tabs = createTabs<TabValues>();

  return (
    <form>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="flex-start" mb="-12px">
        <ValueDisplay
          loading={isLoading}
          data={portfolioData}
        />
        <RHFSelect<Schema>
          name="accountId"
          control={control}
          options={accountOptions}
          onChange={() => queryClient.invalidateQueries({ queryKey: ['portfolioData'] })}
          sx={{ minWidth: '180px', marginTop: '4px' }}
        />
      </Box>
      <AreaChart
        loading={isLoading}
        data={portfolioData?.chart}
        currency={portfolioData?.currency}
        defaultRange={3}
      />
      <Tabs value={tabValue} setValue={setTabValue} mt="10px" pb="25px">
        <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" mb="18px">
          <Tabs.List>
            <Tabs.Trigger value="holdings">Holdings</Tabs.Trigger>
            <Tabs.Trigger value="trades">Trades</Tabs.Trigger>
            <Tabs.Trigger value="buyHistory">Buy History</Tabs.Trigger>
            <Tabs.Trigger value="sellHistory">Sell History</Tabs.Trigger>
          </Tabs.List>
          <TableActions accountId={watch('accountId')} apiRefs={apiRefs} />
        </Box>
        <Tabs.Content value="holdings">
          <HoldingsTable
            apiRef={apiRefs.holdings}
            rows={portfolioData?.holdings ?? []}
          />
        </Tabs.Content>
        <Tabs.Content value="trades">
          <TradesTable
            apiRef={apiRefs.trades}
            rows={portfolioData?.trades ?? []}
          />
        </Tabs.Content>
        <Tabs.Content value="buyHistory">
          <BuyHistoryTable
            apiRef={apiRefs.buyHistory}
            rows={portfolioData?.buyHistory ?? []}
          />
        </Tabs.Content>
        <Tabs.Content value="sellHistory">
          <SellHistoryTable
            apiRef={apiRefs.sellHistory}
            rows={portfolioData?.sellHistory ?? []}
          />
        </Tabs.Content>
      </Tabs>
    </form>
  );
};

export default Portfolio;
