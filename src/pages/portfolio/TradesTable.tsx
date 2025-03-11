import { RefObject } from 'react';
import clsx from 'clsx';

import {
  DataGrid,
  GridApi,
  GridCellParams,
  GridColDef,
} from '@mui/x-data-grid';

import { dayjsParse, numberFormat, renderHeader } from '@utils';
import { TradeRow } from '@types';

interface TradesTableProps {
  apiRef: RefObject<GridApi>;
  rows: TradeRow[];
};

const TradesTable = ({ apiRef, rows }: TradesTableProps) => (
  <DataGrid
    apiRef={apiRef}
    rows={rows}
    columns={columns}
    initialState={{
      columns: {
        columnVisibilityModel: {
          exchange: false,
          brokerage: false,
          gst: false,
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
        sortModel: [{ field: 'date', sort: 'desc' }],
      },
    }}
    sx={{
      '& .color-cell.buy': {
        color: 'success.main',
        fontWeight: 700,
      },
      '& .color-cell.sell': {
        color: 'error.main',
        fontWeight: 700,
      },
    }}
  />
);

const colorCell = (params: GridCellParams<TradeRow, string>) => clsx('color-cell', {
  buy: params.value === 'BUY',
  sell: params.value === 'SELL',
});

const columns: GridColDef[] = [
  {
    field: 'date',
    headerName: 'Date',
    minWidth: 175,
    flex: 3,
    renderHeader,
    sortComparator: (v1: string, v2: string) => dayjsParse(v2).isBefore(dayjsParse(v1)) ? 1 : -1,
  },
  {
    field: 'accountName',
    headerName: 'Account',
    minWidth: 100,
    flex: 2,
    renderHeader,
  },
  {
    field: 'type',
    headerName: 'Type',
    minWidth: 80,
    flex: 1.5,
    renderHeader,
    cellClassName: colorCell,
  },
  {
    field: 'symbol',
    headerName: 'Symbol',
    minWidth: 100,
    flex: 1.5,
    renderHeader,
  },
  {
    field: 'exchange',
    headerName: 'Exchange',
    minWidth: 105,
    flex: 1.5,
    renderHeader,
  },
  {
    field: 'currency',
    headerName: 'Currency',
    minWidth: 100,
    flex: 1.5,
    renderHeader,
  },
  {
    field: 'quantity',
    headerName: 'Units',
    minWidth: 75,
    flex: 1.5,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value),
  },
  {
    field: 'price',
    headerName: 'Price',
    minWidth: 100,
    flex: 2,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 3 }),
  },
  {
    field: 'brokerage',
    headerName: 'Brokerage',
    minWidth: 108,
    flex: 2,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 2 }),
  },
  {
    field: 'gst',
    headerName: 'GST',
    minWidth: 90,
    flex: 1.5,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 2 }),
  },
  {
    field: 'total',
    headerName: 'Total',
    minWidth: 100,
    flex: 2,
    renderHeader,
    valueFormatter: (value: number) => numberFormat('decimal', value, { decimals: 2 }),
  },
  {
    field: 'tradeId',
    headerName: 'Trade Id',
    minWidth: 320,
    flex: 4,
    renderHeader,
  },
];

export default TradesTable;
