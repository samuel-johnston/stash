import { Control, Controller, ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { NumericFormat } from 'react-number-format';

type RHFNumericTextFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  startAdornment?: string;
  endAdornment?: string;
  /**
   * Allow negative number inputs?
   */
  allowNegative?: boolean;
  /**
   * Number of allowed decimal places
   */
  decimalScale?: number;
} & Omit<TextFieldProps, keyof ControllerRenderProps<T, Path<T>> | 'helperText' | 'type' | 'defaultValue'>;

const RHFNumericTextField = <T extends FieldValues>({
  name,
  control,
  startAdornment,
  endAdornment,
  allowNegative,
  decimalScale,
  ...props
}: RHFNumericTextFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { value, onChange, ref, ...fieldProps }, fieldState: { error } }) => (
      <NumericFormat
        {...fieldProps}
        {...props}
        value={value}
        onValueChange={({ floatValue }) => onChange(floatValue)}
        customInput={TextField}
        decimalScale={decimalScale}
        allowNegative={allowNegative}
        allowLeadingZeros={false}
        error={!!error}
        helperText={error?.message ?? ' '}
        slotProps={{
          formHelperText: {
            style: {
              height: '0px',
            },
          },
          input: {
            startAdornment: startAdornment && <InputAdornment position="start">{startAdornment}</InputAdornment>,
            endAdornment: endAdornment && <InputAdornment position="end">{endAdornment}</InputAdornment>,
          },
        }}
      />
    )}
  />
);

export default RHFNumericTextField;
