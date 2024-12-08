import { SyntheticEvent, useEffect, useState } from "react";
import { useFormikContext } from "formik";

// Material UI
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { FilterOptionsState, SxProps, Theme } from "@mui/material";
import TextField from "@mui/material/TextField";

// Types
import { Option } from "../../electron/types";

interface Props {
  label: string;
  name: string;
  value: Option[];
  options: Option[];
  allowNewOptions?: boolean;
  sx?: SxProps<Theme>;
}

const filter = createFilterOptions<Option | string>();

const MultiSelectInput = (props: Props) => {
  const { setFieldValue } = useFormikContext();
  const { label, name, value, allowNewOptions, sx } = props;
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    setOptions(props.options);
  }, [props.options]);

  /**
   * Handles value change when input is updated.
   */
  const handleChangeInput = (event: SyntheticEvent, newValues: (Option | string)[]) => {
    if (newValues.length === 0) {
      setFieldValue(name, []);
      return;
    }

    // New value will always be the last value in the array
    const newValue = newValues[newValues.length - 1];

    // If new value was created by pressing enter
    if (typeof newValue === "string") {
      // Check if option is already existing/selected
      const existingOption = options.find((option) => option.label === newValue);
      const selected = value.some((option) => option.label === newValue);

      // User selects an existing option
      if (existingOption && !selected) {
        setFieldValue(name, [...value, existingOption]);
        return;
      }

      // User creates a new option
      if (allowNewOptions && !existingOption) {
        const newOption: Option = { label: newValue };
        setOptions([...options, newOption]);
        setFieldValue(name, [...value, newOption]);
        return;
      }

      // Otherwise, do nothing if invalid action
      return;
    }

    // If new value created dynamically on dropdown "Add [inputValue]"
    if (newValue.inputValue !== undefined) {
      const newOption: Option = { label: newValue.inputValue };
      setOptions([...options, newOption]);
      setFieldValue(name, [...value, newOption]);
      return;
    }

    // Option is selected normally
    setFieldValue(name, newValues);
  };

  /**
   * Handles filtering which options to render in the dropdown.
   */
  const handleFilterOptions = (options: (Option | string)[], state: FilterOptionsState<Option | string>) => {
    const filtered = filter(options, state);
    const { inputValue } = state;

    const existingOption = options.some((option) => {
      return (typeof option === "string")
        ? inputValue === option
        : inputValue === option.label;
    });

    const selectedOption = value.some((option) => {
      return (typeof option === "string")
        ? inputValue === option
        : inputValue === option.label;
    });

    // Suggest the creation of a new value (if applicable)
    if (allowNewOptions && inputValue !== "" && !existingOption && !selectedOption) {
      filtered.push({
        inputValue,
        label: `Add "${inputValue}"`,
      });
    }

    return filtered;
  };

  /**
   * Handles what to display for a given option.
   */
  const handleOptionLabel = (option: Option | string) => {
    // Value selected with enter from the input
    if (typeof option === "string") {
      return option;
    }

    // Add option created dynamically on dropdown
    if (option.inputValue !== undefined) {
      return option.inputValue;
    }

    // Regular option
    return option.label;
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      clearOnBlur
      handleHomeEndKeys
      disableCloseOnSelect
      value={value}
      options={options}
      onChange={handleChangeInput}
      filterOptions={handleFilterOptions}
      getOptionLabel={handleOptionLabel}
      renderOption={(props, option) => (
        <li {...props}>
          {typeof option === "string" ? option : option.label}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} />}
      sx={sx}
    />
  );
};

export default MultiSelectInput;
