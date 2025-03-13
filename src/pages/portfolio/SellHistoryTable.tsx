import { RefObject } from 'react';
import clsx from 'clsx';

import {
  DataGrid,
  GridApi,
  GridCellParams,
  GridColDef,
} from '@mui/x-data-grid';

import { dayjsParse, numberFormat } from '@utils';
import { SellHistoryRow } from '@types';

interface SellHistoryTableProps {
  apiRef: RefObject<GridApi>;
  rows: SellHistoryRow[];
};

const SellHistoryTable = ({ apiRef, rows }: SellHistoryTableProps) => (
  <DataGrid
    apiRef={apiRef}
    rows={rows}
    columns={columns}
    initialState={{
      columns: {
        columnVisibilityModel: {
          buyDate: false,
          exchange: false,
          appliedBuyBrokerage: false,
          appliedSellBrokerage: false,
          appliedBuyGst: false,
          appliedSellGst: false,
          tradeId: false,
        },
      },
      pagination: {
        paginationModel: {
          page: 0,
          pageSize: 10,
        },
      },
      sorting: {
        sortModel: [{ field: 'sellDate', sort: 'desc' }],
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

const colorCell = (params: GridCellParams<SellHistoryRow, number>) => clsx('color-cell', {
  negative: (params.value ?? 0) < 0,
  positive: (params.value ?? 0) > 0,
});

const columns: GridColDef[] = [
  {
    field: 'sellDate',
    headerName: 'Sell Date',
    minWidth: 175,
    flex: 3,
    sortComparator: (v1: string, v2: string) => dayjsParse(v2).isBefore(dayjsParse(v1)) ? 1 : -1,
  },
  {
    field: 'buyDate',
    headerName: 'Buy Date',
    minWidth: 175,
    flex: 3,
    sortComparator: (v1: string, v2: string) => dayjsParse(v2).isBefore(dayjsParse(v1)) ? 1 : -1,
  },
  {
    field: 'accountName',
    headerName: 'Account',
    minWidth: 100,
    flex: 2,
  },
  {
    field: 'symbol',
    headerName: 'Symbol',
    minWidth: 100,
    flex: 1.5,
  },
  {
    field: 'exchange',
    headerName: 'Exchange',
    minWidth: 105,
    flex: 1.5,
  },
  {
    field: 'currency',
    headerName: 'Currency',
    minWidth: 100,
    flex: 1.5,
  },
  {
    field: 'quantity',
    headerName: 'Units',
    minWidth: 75,
    flex: 1.5,
    valueFormatter: (value: number) => numberFormat('decimal', value),
  },
  {
    field: 'buyPrice',
    headerName: 'Buy Price',
    minWidth: 100,
    flex: 2,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 3 }),
  },
  {
    field: 'sellPrice',
    headerName: 'Sell Price',
    minWidth: 100,
    flex: 2,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 3 }),
  },
  {
    field: 'appliedBuyBrokerage',
    headerName: 'Buy Brokerage',
    minWidth: 126,
    flex: 2,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 3 }),
  },
  {
    field: 'appliedSellBrokerage',
    headerName: 'Sell Brokerage',
    minWidth: 130,
    flex: 2,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 3 }),
  },
  {
    field: 'appliedBuyGst',
    headerName: 'Buy GST',
    minWidth: 90,
    flex: 1.5,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 3 }),
  },
  {
    field: 'appliedSellGst',
    headerName: 'Sell GST',
    minWidth: 90,
    flex: 1.5,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 3 }),
  },
  {
    field: 'total',
    headerName: 'Total',
    minWidth: 100,
    flex: 2,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 2 }),
  },
  {
    field: 'profitOrLoss',
    headerName: 'Profit/Loss',
    minWidth: 110,
    flex: 2,
    cellClassName: colorCell,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 2 }),
  },
  {
    field: 'capitalGainOrLoss',
    headerName: 'Capital Gain/Loss',
    minWidth: 150,
    flex: 2.5,
    cellClassName: colorCell,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 2 }),
  },
  {
    field: 'cgtDiscount',
    headerName: 'CGT Discount',
    minWidth: 120,
    flex: 2,
    valueFormatter: (value: boolean) => value ? 'Yes' : 'No',
  },
  {
    field: 'tradeId',
    headerName: 'Trade Id',
    minWidth: 320,
    flex: 4,
  },
];

export default SellHistoryTable;
