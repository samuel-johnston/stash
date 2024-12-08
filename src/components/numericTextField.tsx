import { NumericFormat } from "react-number-format";

// Material UI
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { TextFieldProps } from "@mui/material";

type Props = Omit<TextFieldProps, "defaultValue" | "type"> & {
  value: string;
  /**
   * Add an adornment to the `TextField`?
   */
  adornment?: "currency" | "percent";
  /**
   * Allow negative number inputs?
   */
  allowNegative?: boolean;
};

/**
 * Wrapper around Material UI's `<TextField>` component adding an optional percent/currency adornment,
 * and restricting inputs to numerical values only.
 */
const NumericTextField = (props: Props) => {
  const { adornment, value, allowNegative, ...otherProps } = props;
  return (
    <NumericFormat
      {...otherProps}
      type="text"
      value={value}
      customInput={TextField}
      allowNegative={allowNegative ?? false}
      allowLeadingZeros={false}
      slotProps={{
        input: {
          startAdornment: adornment === "currency" && <InputAdornment position="start">$</InputAdornment>,
          endAdornment: adornment === "percent" && <InputAdornment position="end">%</InputAdornment>,
        },
      }}
    />
  );
};

export default NumericTextField;
