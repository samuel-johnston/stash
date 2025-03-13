import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

export interface SelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

type RHFSelectProps<T extends FieldValues> = {
  label?: string;
  name: Path<T>;
  control: Control<T>;
  options?: SelectOption[];
  onChange?: () => void;
  sx?: SxProps<Theme>;
};

const filter = createFilterOptions<SelectOption>({
  matchFrom: 'any',
  stringify: (option) => `${option.label} ${option.subtitle || ''}`,
});

const RHFSelect = <T extends FieldValues>({
  label,
  name,
  control,
  options,
  onChange: onChangeCallback,
  sx,
}: RHFSelectProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { value, onChange, ref }, fieldState: { error } }) => (
      <Autocomplete
        size="small"
        options={options || []}
        value={options?.find((option) => option.value === value) ?? null}
        onChange={(_, newValue) => {
          onChange(newValue ? newValue.value : '');
          if (onChangeCallback) onChangeCallback();
        }}
        filterOptions={filter}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            inputRef={ref}
            error={!!error}
            helperText={error?.message}
            label={label}
            placeholder="-- Select --"
            slotProps={{
              formHelperText: {
                style: {
                  height: '0px',
                },
              },
            }}
          />
        )}
        renderOption={({ key, ...props }, option) => (
          <li key={key} {...props}>
            <Stack sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Typography color="primary">{option.label}</Typography>
              <Typography noWrap color="secondary">{option.subtitle}</Typography>
            </Stack>
          </li>
        )}
        sx={{ ...sx }}
      />
    )}
  />
);

export default RHFSelect;
