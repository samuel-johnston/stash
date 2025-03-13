import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';

export const renderMultilineCell = (params: GridRenderCellParams<GridValidRowModel, string | number | null>) => (
  <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
    <Typography
      sx={{
        display: '-webkit-box',
        WebkitLineClamp: '2',
        WebkitBoxOrient: 'vertical',
        whiteSpace: 'normal',
      }}
    >
      {params.value}
    </Typography>
  </div>
);
