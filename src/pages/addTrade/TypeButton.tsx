import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

type TypeButtonProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  value: 'BUY' | 'SELL';
  onChange?: () => void;
};

const TypeButton = <T extends FieldValues>({
  name,
  control,
  value,
  onChange,
}: TypeButtonProps<T>) => {
  const { palette } = useTheme();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Button
          fullWidth
          size="large"
          variant={field.value === value ? 'contained' : 'outlined'}
          color={value === 'BUY' ? 'success' : 'error'}
          onClick={() => {
            field.onChange(value);
            if (onChange) onChange();
          }}
          sx={{ borderColor: palette[value === 'BUY' ? 'success' : 'error'].main }}
        >
          <Typography variant="h5" fontWeight={500}>
            {value}
          </Typography>
        </Button>
      )}
    />
  );
};

export default TypeButton;
