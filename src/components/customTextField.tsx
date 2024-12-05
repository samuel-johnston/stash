import { InputAdornment, TextField, TextFieldProps } from "@mui/material";
import { NumericFormat } from "react-number-format";

type Props = Omit<TextFieldProps, "defaultValue" | "type"> & {
  value: string;
  /**
   * The type of the `CustomTextField`.
  */
  type: "currency" | "percent" | "number";
};

/**
 * Wrapper around Material UI's TextField component adding percent/currency adornments,
 * and restricting inputs to numerical.
 */
const CustomTextField = (props: Props) => {
  const { type, value, ...otherProps } = props;
  return (
    <NumericFormat
      value={value}
      customInput={TextField}
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

export default CustomTextField;