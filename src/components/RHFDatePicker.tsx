import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Dayjs } from 'dayjs';

import { DesktopDateTimePicker, DesktopDateTimePickerProps } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

type RHFDatePickerProps<T extends FieldValues> = Omit<DesktopDateTimePickerProps<Dayjs>, 'name'> & {
  name: Path<T>;
  control: Control<T>;
};

const RHFDatePicker = <T extends FieldValues>({ name, control, ...props }: RHFDatePickerProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DesktopDateTimePicker
          {...props}
          {...field}
          format="DD/MM/YYYY hh:mm A"
          viewRenderers={{
            hours: null,
            minutes: null,
            seconds: null,
          }}
          slotProps={{
            actionBar: {
              actions: [],
            },
            textField: {
              fullWidth: true,
              size: 'small',
              helperText: error?.message,
              sx: {
                '& .MuiFormHelperText-root': {
                  height: '0px',
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    )}
  />
);

export default RHFDatePicker;
