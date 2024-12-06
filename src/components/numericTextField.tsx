import { InputAdornment, TextField, TextFieldProps } from "@mui/material";
import { NumericFormat } from "react-number-format";

type Props = Omit<TextFieldProps, "defaultValue" | "type"> & {
  value: string;
  /**
   * The type of the `NumericTextField`.
  */
  type?: "currency" | "percent";
  /**
   * Allow negative number inputs?
   */
  allowNegative?: boolean;
};

/**
 * Wrapper around Material UI's TextField component adding percent/currency adornments,
 * and restricting inputs to numerical.
 */
const NumericTextField = (props: Props) => {
  const { type, value, allowNegative, ...otherProps } = props;
  return (
    <NumericFormat
      value={value}
      customInput={TextField}
      allowNegative={allowNegative ?? false}
      allowLeadingZeros={false}
      type="text"
      slotProps={{
        input: {
          startAdornment: type === "currency" && <InputAdornment position="start">$</InputAdornment>,
          endAdornment: type === "percent" && <InputAdornment position="end">%</InputAdornment>,
        }
      }}
      {...otherProps}
    />
  );
};

export default NumericTextField;