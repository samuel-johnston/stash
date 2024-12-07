import { PerformantTextField } from "./PerformantTextField/index";
import { ChangeEvent, FocusEvent } from "react";

interface Props {
  label: string;
  valueName: string;
  value: string;
  handleBlur: (e: FocusEvent<unknown, Element>) => void;
  handleChange: (e: ChangeEvent<unknown>) => void;
  span: number;
  rows: number;
}

const TextArea = (props: Props) => {
  const { label, valueName, value, handleBlur, handleChange, span, rows } = props;
  return (
    <PerformantTextField
      multiline
      rows={rows}
      type="text"
      name={valueName}
      label={label}
      value={value}
      onBlur={handleBlur}
      onChange={handleChange}
      sx={{ gridColumn: `span ${span}` }}
    />
  );
};

export default TextArea;
