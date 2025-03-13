import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid2';

import DialogCloseButton from '@components/DialogCloseButton';
import RHFTextField from '@components/RHFTextField';

export interface Account {
  name: string;
  accountId: string;
}

interface EditAccountDialogProps {
  open: boolean;
  close: () => void;
  selectedAccount: Account;
}

interface EditDialogContentProps {
  close: () => void;
  openDeleteDialog: () => void;
  selectedAccount: Account;
}

interface DeleteDialogContentProps {
  close: () => void;
  selectedAccount: Account;
}

const editAccountSchema = (selectedAccount: Account) => z.object({
  name: z
    .string()
    .min(1, { message: 'Required' })
    .refine(async (name) => {
      const accounts = await window.electronAPI.getData('accounts');
      const names = Array.from(accounts.values())
        .filter((account) => account.accountId !== selectedAccount.accountId)
        .map((account) => account.name);
      return !names.includes(name);
    }, { message: 'Name already exists' }),
  accountId: z.string(),
});

const EditDialogContent = ({ close, openDeleteDialog, selectedAccount }: EditDialogContentProps) => {
  const queryClient = useQueryClient();

  const schema = editAccountSchema(selectedAccount);
  type Schema = z.infer<typeof schema>;

  const { control, handleSubmit } = useForm<Schema>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      accountId: '',
    },
    values: selectedAccount,
  });

  const { mutateAsync: renameAccount } = useMutation({
    mutationFn: window.electronAPI.renameAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountData'] });
    },
  });

  const onSubmit = async (values: Account) => {
    await renameAccount(values);
    enqueueSnackbar('Successfully saved!', { variant: 'success' });
    close();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>
        Edit Account
        <DialogContentText mt="2px">
          Make changes to your account here. Click save when you're done.
        </DialogContentText>
      </DialogTitle>
      <DialogContent sx={{ mt: '12px', mb: '12px' }}>
        <Grid container columns={14} columnSpacing={2} rowSpacing={3}>
          <Grid size={4} display="flex" alignItems="center" justifyContent="flex-end">
            <Typography variant="h6">
              Name
            </Typography>
          </Grid>
          <Grid size={10}>
            <RHFTextField<Schema>
              fullWidth
              name="name"
              size="small"
              control={control}
            />
          </Grid>
          <Grid size={4} display="flex" alignItems="center" justifyContent="flex-end">
            <Typography variant="h6">
              Account No.
            </Typography>
          </Grid>
          <Grid size={10}>
            <RHFTextField<Schema>
              disabled
              fullWidth
              name="accountId"
              size="small"
              control={control}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteForeverRoundedIcon />}
          onClick={openDeleteDialog}
        >
          Delete
        </Button>
        <Button type="submit" variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </form>
  );
};

const deleteAccountSchema = (selectedAccount: Account) => z.object({
  name: z.string().refine(
    (name) => name === selectedAccount.name,
    { message: `Input does not match "${selectedAccount.name}"` },
  ),
  accountId: z.string(),
});

const DeleteDialogContent = ({ close, selectedAccount }: DeleteDialogContentProps) => {
  const queryClient = useQueryClient();

  const schema = deleteAccountSchema(selectedAccount);
  type Schema = z.infer<typeof schema>;

  const { control, handleSubmit } = useForm<Schema>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      accountId: '',
    },
    values: {
      name: '',
      accountId: selectedAccount.accountId,
    },
  });

  const { mutateAsync: deleteAccount } = useMutation({
    mutationFn: window.electronAPI.deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountData'] });
    },
  });

  const onSubmit = async (values: Account) => {
    await deleteAccount(values.accountId);
    enqueueSnackbar(`${values.name} successfully deleted!`, { variant: 'success' });
    close();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>
        Are you sure?
        <DialogContentText mt="4px" mb="8px">
          This action is permanent and irreversible.
          Deleting this account will remove all trade data for this account.
        </DialogContentText>
        <DialogContentText display="inline">To confirm, type "</DialogContentText>
        <Typography display="inline" color="primary" fontSize={15} fontWeight={400}>
          {selectedAccount.name}
        </Typography>
        <DialogContentText display="inline">" in the box below.</DialogContentText>
      </DialogTitle>
      <DialogContent>
        <RHFTextField<Schema>
          fullWidth
          name="name"
          size="small"
          control={control}
          sx={{ mb: '8px' }}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={close}>Cancel</Button>
        <Button type="submit" variant="contained" color="error">Delete</Button>
      </DialogActions>
    </form>
  );
};

const EditAccountDialog = ({ open, close, selectedAccount }: EditAccountDialogProps) => {
  const [dialogView, setDialogView] = useState<'edit' | 'delete'>('edit');

  // Ensure view is edit when dialog is opened
  useEffect(() => {
    if (open) setDialogView('edit');
  }, [open]);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={close} closeAfterTransition={true}>
      {dialogView === 'edit'
        ? (
            <EditDialogContent
              close={close}
              openDeleteDialog={() => setDialogView('delete')}
              selectedAccount={selectedAccount}
            />
          )
        : (
            <DeleteDialogContent
              close={close}
              selectedAccount={selectedAccount}
            />
          )}
      <DialogCloseButton onClose={close} />
    </Dialog>
  );
};

export default EditAccountDialog;
