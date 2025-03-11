import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

type RHFSwitchProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
};

const RHFSwitch = <T extends FieldValues>({ name, control, label }: RHFSwitchProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControlLabel
        control={<Switch {...field} checked={field.value} />}
        label={label}
      />
    )}
  />
);

export default RHFSwitch;
