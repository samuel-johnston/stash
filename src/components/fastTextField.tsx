import { ChangeEvent, FocusEvent, memo, useEffect, useRef, useState } from "react";
import { TextField, TextFieldProps } from "@mui/material";
import NumericTextField from "./numericTextField";
import { useField } from "formik";

type Props = Omit<TextFieldProps, "type" | "value" | "name" | "onChange" | "onFocus" | "onBlur"> & {
  name: string;
  value: string;
  /**
   * The type of input used for the `TextField`.
   */
  type: "text" | "number";
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
 * Optimised `<TextField>` that is meant to be used on large forms.
 * Heavily inspired by https://github.com/superjose/increase-formik-performance-react.
 */
const FastTextField: React.FC<Props> = memo((props) => {
  const { name, type, adornment, allowNegative, ...otherProps } = props;
  const [field, meta] = useField<string>(props.name);

  /**
   * For performance reasons (possible due to CSS in JS issues), heavy views
   * affect re-renders (Formik changes state in every re-render), bringing keyboard
   * input to its knees. To control this, we create a setState that handles the field's inner
   * (otherwise you wouldn't be able to type) and then propagate the change to Formik onBlur and
   * onFocus.
   */
  const [fieldValue, setFieldValue] = useState<string>(field.value);
  useEffect(() => {
    if (meta.touched) {
      return;
    }
    if (field.value !== fieldValue) {
      setFieldValue(field.value);
    }
  }, [field.value]);

  /**
   * This is a special useRef that is used to propagate Formik's changes
   * to the component (the other way around that is done).
   *
   * This needs to be done whenever the name property changes and the content of the
   * component remains the same.
   *
   * An example is when you have a dynamic view that changes the TextField's name attribute.
   * If we don't do this, the useBlur hook will overwrite the value that you left before you
   * changed the TextField's value.
   */
  const flagRef = useRef(true);
  useEffect(() => {
    if (flagRef.current) {
      flagRef.current = false;
      return;
    }
    setFieldValue(field.value);
  }, [name]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue(e.target.value);
  };

  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    window.setTimeout(() => {
      field.onChange({
        target: {
          name,
          value: e.target.value || "",
        },
      });
    }, 0);
  };

  const commonProps = {
    ...field,
    name,
    value: fieldValue,
    onChange,
    onBlur,
    onFocus: onBlur,
  };

  return (type === "number")
    ? (
        <NumericTextField
          {...otherProps}
          adornment={adornment}
          allowNegative={allowNegative}
          {...commonProps}
        />
      )
    : (
        <TextField
          {...otherProps}
          type="text"
          {...commonProps}
        />
      );
});

export default FastTextField;
