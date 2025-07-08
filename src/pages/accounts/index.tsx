import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import LoadingScreen from '@components/LoadingScreen';
import ErrorScreen from '@components/ErrorScreen';

import EditAccountDialog, { Account } from './EditAccountDialog';
import AddAccountDialog from './AddAccountDialog';
import GridItem from './GridItem';

const Accounts = () => {
  const { palette } = useTheme();

  const { data: accountData, error, status } = useQuery({
    queryKey: ['accountData'],
    queryFn: window.electronAPI.getAccountData,
  });

  const [openAddAccountDialog, setOpenAddAccountDialog] = useState(false);
  const [openEditAccountDialog, setOpenEditAccountDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account>({
    name: '',
    accountId: '',
  });

  if (status === 'pending') return <LoadingScreen />;
  if (status === 'error') return <ErrorScreen message={error.message} />;

  return (
    <Box>
      <AddAccountDialog
        open={openAddAccountDialog}
        close={() => setOpenAddAccountDialog(false)}
      />
      <EditAccountDialog
        open={openEditAccountDialog}
        close={() => setOpenEditAccountDialog(false)}
        selectedAccount={selectedAccount}
      />
      <Stack rowGap="25px">
        {accountData!.map((account) => (
          <Stack
            key={account.accountId}
            divider={<Divider />}
            border={`1px solid ${palette.grey[500]}`}
            borderRadius="8px"
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              p="12px"
            >
              <Stack ml="4px" mt="-4px">
                <Typography fontSize={26} fontWeight={400}>
                  {account.name}
                </Typography>
                <Typography fontSize={14} color="secondary">
                  {account.accountId}
                </Typography>
              </Stack>
              <Stack direction="row" columnGap="10px">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSelectedAccount({
                      name: account.name,
                      accountId: account.accountId,
                    });
                    setOpenEditAccountDialog(true);
                  }}
                >
                  Edit
                </Button>
                <Button size="small" variant="contained">
                  Holdings
                </Button>
              </Stack>
            </Stack>
            <Grid
              container
              rowSpacing={1}
              columnSpacing={4}
              columns={{ xs: 6, sm: 6, md: 12, lg: 12, xl: 12 }}
              p="16px"
              mb="2px"
            >
              <GridItem
                showTriangle
                coloured
                style="currency"
                currency={account.currency}
                label="Today's Change"
                value={account.todayChange}
                percent={account.todayChangePerc ?? undefined}
                order={{ sm: 1, md: 1 }}
              />
              <GridItem
                label="Market Value"
                value={account.marketValue}
                style="currency"
                currency={account.currency}
                order={{ sm: 4, md: 2 }}
              />
              <GridItem
                showTriangle
                coloured
                style="currency"
                currency={account.currency}
                label="Unrealised Profit/Loss"
                value={account.unrealisedProfitOrLoss}
                percent={account.unrealisedProfitOrLossPerc ?? undefined}
                order={{ sm: 2, md: 3 }}
              />
              <GridItem
                label="Total Cost"
                value={account.totalCost}
                style="currency"
                currency={account.currency}
                order={{ sm: 5, md: 4 }}
              />
              <GridItem
                showTriangle
                label="Realised Profit/Loss"
                value={account.realisedProfitOrLoss}
                percent={account.realisedProfitOrLossPerc ?? undefined}
                order={{ sm: 3, md: 5 }}
              />
            </Grid>
          </Stack>
        ))}
        <Button
          disableTouchRipple
          onClick={() => setOpenAddAccountDialog(true)}
          sx={{ border: `1px solid ${palette.grey[500]}` }}
        >
          Add New Account
        </Button>
      </Stack>
    </Box>
  );
};

export default Accounts;
