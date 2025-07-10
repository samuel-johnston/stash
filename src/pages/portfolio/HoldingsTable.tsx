import { RefObject } from 'react';
import clsx from 'clsx';

import {
  DataGrid,
  GridApi,
  GridCellParams,
  GridColDef,
} from '@mui/x-data-grid';

import { numberFormat, renderHeader, renderMultilineCell } from '@utils';
import { HoldingRow } from '@types';

interface HoldingsTableProps {
  apiRef: RefObject<GridApi>;
  rows: HoldingRow[];
};

const HoldingsTable = ({ apiRef, rows }: HoldingsTableProps) => (
  <DataGrid
    apiRef={apiRef}
    rows={rows}
    columns={columns}
    initialState={{
      columns: {
        columnVisibilityModel: {
          type: false,
          exchangeRate: false,
          exchange: false,
          purchaseCost: false,
          firstPurchase: false,
          lastPurchase: false,
        },
      },
      pagination: {
        paginationModel: {
          page: 0,
          pageSize: 10,
        },
      },
    }}
    sx={{
      '& .color-cell.positive': {
        color: 'success.main',
        fontWeight: 600,
      },
      '& .color-cell.negative': {
        color: 'error.main',
        fontWeight: 600,
      },
    }}
  />
);

const colorCell = (params: GridCellParams<HoldingRow, number>) => clsx('color-cell', {
  negative: (params.value ?? 0) < 0,
  positive: (params.value ?? 0) > 0,
});

const columns: GridColDef[] = [
  {
    field: 'symbol',
    headerName: 'Symbol',
    minWidth: 90,
    flex: 1,
    renderHeader,
  },
  {
    field: 'name',
    headerName: 'Name',
    minWidth: 230,
    flex: 4,
    renderHeader,
    renderCell: renderMultilineCell,
  },
  {
    field: 'exchange',
    headerName: 'Exchange',
    minWidth: 105,
    flex: 1,
    renderHeader,
  },
  {
    field: 'currency',
    headerName: 'Currency',
    minWidth: 100,
    flex: 1,
    renderHeader,
  },
  {
    field: 'exchangeRate',
    headerName: 'FX Rate',
    minWidth: 90,
    flex: 1,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 4 }),
  },
  {
    field: 'type',
    headerName: 'Type',
    minWidth: 75,
    flex: 1,
    renderHeader,
  },
  {
    field: 'units',
    headerName: 'Units',
    headerAlign: 'right',
    align: 'right',
    minWidth: 75,
    flex: 1.5,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value),
  },
  {
    field: 'buyPrice',
    headerName: 'Buy Price',
    headerAlign: 'right',
    align: 'right',
    minWidth: 95,
    flex: 2,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 4 }),
  },
  {
    field: 'lastPrice',
    headerName: 'Last Price',
    headerAlign: 'right',
    align: 'right',
    minWidth: 90,
    flex: 2,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 3 }),
  },
  {
    field: 'marketValue',
    headerName: 'Market Value',
    headerAlign: 'right',
    align: 'right',
    minWidth: 100,
    flex: 2,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 2 }),
  },
  {
    field: 'purchaseCost',
    headerName: 'Purchase Cost',
    headerAlign: 'right',
    align: 'right',
    minWidth: 103,
    flex: 2,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 2 }),
  },
  {
    field: 'profitOrLoss',
    headerName: 'Profit/Loss',
    headerAlign: 'right',
    align: 'right',
    minWidth: 96,
    flex: 2,
    renderHeader,
    cellClassName: colorCell,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 2 }),
  },
  {
    field: 'profitOrLossPerc',
    headerName: 'Profit/Loss %',
    headerAlign: 'right',
    align: 'right',
    minWidth: 98,
    flex: 2,
    renderHeader,
    cellClassName: colorCell,
    valueFormatter: (value: number) => numberFormat('percent', value, { decimals: 2 }),
  },
  {
    field: 'todayChange',
    headerName: 'Today\'s Change',
    headerAlign: 'right',
    align: 'right',
    minWidth: 95,
    flex: 2,
    renderHeader,
    cellClassName: colorCell,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 2 }),
  },
  {
    field: 'todayChangePerc',
    headerName: 'Today\'s Change %',
    headerAlign: 'right',
    align: 'right',
    minWidth: 110,
    flex: 2,
    renderHeader,
    cellClassName: colorCell,
    valueFormatter: (value: number) => numberFormat('percent', value, { decimals: 2 }),
  },
  {
    field: 'firstPurchase',
    headerName: 'First Purchase',
    headerAlign: 'right',
    align: 'right',
    minWidth: 115,
    flex: 2.5,
    renderHeader,
    valueFormatter: (value: string) => value.split(' ')[0],
  },
  {
    field: 'lastPurchase',
    headerName: 'Last Purchase',
    headerAlign: 'right',
    align: 'right',
    minWidth: 115,
    flex: 2.5,
    renderHeader,
    valueFormatter: (value: string) => value.split(' ')[0],
  },
  {
    field: 'weightPerc',
    headerName: 'Weight %',
    headerAlign: 'right',
    align: 'right',
    renderHeader,
    valueFormatter: (value: number) => numberFormat('percent', value, { decimals: 2 }),
  },
];

export default HoldingsTable;
