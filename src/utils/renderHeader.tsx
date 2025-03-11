import { GridColumnHeaderParams, GridValidRowModel } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';

export const renderHeader = (params: GridColumnHeaderParams<GridValidRowModel, string>) => (
  <Typography
    sx={{
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      whiteSpace: 'normal',
      textAlign: 'right',
      fontSize: 14.5,
      fontWeight: 500,
    }}
  >
    {params.colDef.headerName?.replace('/', '/\u200B').replace(' %', '\u00A0%')}
  </Typography>
);
