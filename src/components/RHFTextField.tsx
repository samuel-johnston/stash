import { Control, Controller, ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import TextField, { TextFieldProps } from '@mui/material/TextField';

type RHFTextFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  disabled?: boolean;
} & Omit<TextFieldProps, keyof ControllerRenderProps<T, Path<T>> | 'helperText'>;

const RHFTextField = <T extends FieldValues>({
  name,
  control,
  slotProps,
  ...props
}: RHFTextFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        {...props}
        error={!!error}
        helperText={error?.message ?? ' '}
        slotProps={{
          ...slotProps,
          formHelperText: {
            style: {
              height: '0px',
            },
          },
        }}
      />
    )}
  />
);

export default RHFTextField;
