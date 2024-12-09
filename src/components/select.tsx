import { useFormikContext } from "formik";
import { SyntheticEvent } from "react";

// Material UI
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { SxProps, Theme } from "@mui/material";

// Types
import { Option } from "../../electron/types";

type Props = Partial<Pick<TextFieldProps, "error" | "helperText" | "size">> & {
  label: string;
  name: string;
  value: Option;
  options: Option[];
  capitaliseInput?: boolean;
  sx?: SxProps<Theme>;
};

const SelectInput = (props: Props) => {
  const { setFieldValue } = useFormikContext();
  const {
    label,
    name,
    value,
    options,
    capitaliseInput,
    sx,
    error,
    helperText,
    size,
  } = props;

  /**
   * Handle value change when input is updated.
   */
  const handleChangeInput = (event: SyntheticEvent, newValue: string | Option) => {
    if (newValue === null) {
      setFieldValue(name, null);
      return;
    }

    if (typeof newValue === "string") {
      newValue = { label: newValue };
    }

    if (capitaliseInput) {
      newValue.label.toUpperCase();
    }

    setFieldValue(name, newValue);
  };

  return (
    <Autocomplete
      clearOnBlur
      handleHomeEndKeys
      disableCloseOnSelect
      id={name}
      value={value}
      options={options}
      onChange={handleChangeInput}
      onKeyDown={(event) => {
        // Disable formik submit on enter
        if (event.key === "Enter") event.preventDefault();
      }}
      getOptionLabel={(option) => {
        if (typeof option === "string") return option;
        return option.label;
      }}
      isOptionEqualToValue={(option, value) => {
        if (typeof option !== "string") option = option.label;
        if (typeof value !== "string") value = value.label;
        return option === value;
      }}
      renderOption={(props, option) => (
        <li {...props}>
          {typeof option === "string" ? option : option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size={size}
          error={error}
          helperText={helperText}
          slotProps={{
            htmlInput: {
              ...params.inputProps,
              style: capitaliseInput ? { textTransform: "uppercase" } : undefined,
            },
          }}
        />
      )}
      sx={sx}
    />
  );
};

export default SelectInput;
