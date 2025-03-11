import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { enqueueSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';

import DialogCloseButton from '@components/DialogCloseButton';
import RHFTextField from '@components/RHFTextField';

interface Props {
  open: boolean;
  close: () => void;
}

const schema = z.object({
  name: z
    .string()
    .min(1, { message: 'Required' })
    .refine(
      async (name) => {
        const accounts = await window.electronAPI.getData('accounts');
        return !Array.from(accounts.values()).some((account) => account.name === name);
      },
      { message: 'Name already exists' },
    ),
});

type Schema = z.infer<typeof schema>;

const defaultValues: Schema = {
  name: '',
};

const AddAccountDialog = ({ open, close }: Props) => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<Schema>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { mutateAsync: createAccount } = useMutation({
    mutationFn: window.electronAPI.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accountData'] });
    },
  });

  const onClose = () => {
    reset();
    close();
  };

  const onSubmit = async (values: Schema) => {
    await createAccount(values.name);
    enqueueSnackbar(`${values.name} successfully created!`, { variant: 'success' });
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          Add New Account
          <DialogContentText sx={{ mt: '2px' }}>
            Create a new account. Click save when you're done.
          </DialogContentText>
        </DialogTitle>
        <DialogContent sx={{ mt: '6px' }}>
          <Grid container columnSpacing={2}>
            <Grid size={2} display="flex" alignItems="center" justifyContent="flex-end">
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
        <DialogCloseButton onClose={onClose} />
      </form>
    </Dialog>
  );
};

export default AddAccountDialog;
