import { RefObject, useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { GridStateCommunity } from '@mui/x-data-grid/models/gridStateCommunity';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';

import { Checkbox, IconButton } from '@mui/material';
import { GridApi } from '@mui/x-data-grid';

import DialogCloseButton from '@components/DialogCloseButton';
import { useTabsContext } from '@contexts/TabsContext';

import { TabValues } from './index';

interface TableActionsProps {
  accountId: string;
  apiRefs: Record<TabValues, RefObject<GridApi>>;
}

interface Column {
  field: string;
  headerName?: string;
  visible: boolean;
}

const DownloadCSV = ({ apiRef, fileName }: { apiRef: RefObject<GridApi>; fileName: string }) => {
  return (
    <Button
      disableTouchRipple
      size="small"
      startIcon={<DownloadRoundedIcon />}
      onClick={() => {
        apiRef.current.exportDataAsCsv({
          fileName: fileName + '_' + dayjs().format('YYYY-MM-DD'),
          utf8WithBom: true,
          escapeFormulas: false,
          allColumns: true,
        });
      }}
    >
      Download
    </Button>
  );
};

const ManageColumns = ({ apiRef, title }: { apiRef: RefObject<GridApi>; title: string }) => {
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);

  const updateColumns = () => {
    const allColumns = apiRef.current.getAllColumns();
    const visibleColumns = apiRef.current.getVisibleColumns();
    setColumns(allColumns.map(({ field, headerName = field }) => ({
      field,
      headerName,
      visible: visibleColumns.some((column) => column.field === field),
    })));
  };

  const handleOpen = () => {
    updateColumns();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    updateColumns();
  }, [apiRef]);

  return (
    <>
      <Button
        disableTouchRipple
        size="small"
        startIcon={<ViewColumnRoundedIcon />}
        onClick={handleOpen}
      >
        Columns
      </Button>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>
          {title + ' Columns'}
          <DialogContentText mt="2px">
            Manage column visibility.
          </DialogContentText>
        </DialogTitle>
        <DialogContent sx={{ mt: '6px' }}>
          <Grid container columns={12}>
            {columns.map((column, index) => (
              <Grid size={6} display="flex" alignItems="center" key={column.field}>
                <Checkbox
                  disabled={index === 0}
                  checked={column.visible}
                  onChange={(event) => {
                    apiRef.current.setColumnVisibility(column.field, event.target.checked);
                    updateColumns();
                  }}
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 22 } }}
                />
                <Typography variant="h6">
                  {column.headerName}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>Close</Button>
        </DialogActions>
        <DialogCloseButton onClose={handleClose} />
      </Dialog>
    </>
  );
};

const PageButtons = ({ apiRef }: { apiRef: RefObject<GridApi> }) => {
  const [state, setState] = useState({
    page: 0,
    pageSize: 100,
    rowCount: 0,
  });

  useEffect(() => {
    if (!apiRef.current) return;

    const unsubscribe = apiRef.current.subscribeEvent('stateChange', (state: GridStateCommunity) => {
      const { page, pageSize } = state.pagination.paginationModel;
      const rowCount = state.rows.totalRowCount;
      setState({ page, pageSize, rowCount });
    });

    return () => {
      unsubscribe();
    };
  }, [apiRef]);

  return (
    <>
      {/* Previous Page Button */}
      <IconButton
        onClick={() => apiRef.current.setPage(state.page - 1)}
        disabled={state.page === 0}
      >
        <KeyboardArrowLeftIcon />
      </IconButton>
      {/* Next Page Button */}
      <IconButton
        onClick={() => apiRef.current.setPage(state.page + 1)}
        disabled={state.rowCount <= (state.page + 1) * state.pageSize}
      >
        <KeyboardArrowRightIcon />
      </IconButton>
    </>
  );
};

const formatTitle = (value: string) => {
  const result = value.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const TableActions = ({ accountId, apiRefs }: TableActionsProps) => {
  const { tabValue } = useTabsContext<TabValues>();
  return (
    <Stack direction="row" columnGap="10px" alignItems="center">
      <ManageColumns
        apiRef={apiRefs[tabValue]}
        title={formatTitle(tabValue)}
      />
      <DownloadCSV
        apiRef={apiRefs[tabValue]}
        fileName={accountId === '' ? tabValue : tabValue + '_' + accountId}
      />
      <PageButtons
        apiRef={apiRefs[tabValue]}
      />
    </Stack>
  );
};

export default TableActions;
