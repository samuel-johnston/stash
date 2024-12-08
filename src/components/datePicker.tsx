import { useFormikContext } from "formik";
import { tokens } from "../theme";
import { Dayjs } from "dayjs";

// Material UI
import { DesktopDateTimePicker, DesktopDateTimePickerProps } from "@mui/x-date-pickers/DesktopDateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import useTheme from "@mui/material/styles/useTheme";

type Props = DesktopDateTimePickerProps<Dayjs> & {
  error?: boolean;
  helperText?: React.ReactNode;
};

const DatePicker = (props: Props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { name, label, error, helperText, ...otherProps } = props;
  const { setFieldValue } = useFormikContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopDateTimePicker
        {...otherProps}
        onChange={(newValue) => setFieldValue(name, newValue)}
        format="DD/MM/YYYY hh:mm A"
        viewRenderers={{
          hours: null,
          minutes: null,
          seconds: null,
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            name,
            label,
            error,
            helperText,
          },
          actionBar: {
            actions: [],
          },
          desktopPaper: {
            sx: {
              backgroundColor: colors.grey[900],
              backgroundImage: "none",
              boxShadow: "none",
              marginTop: "4px",
              border: `1px solid ${colors.grey[600]}`,
            },
          },
          popper: {
            sx: {
              ".MuiButtonBase-root.Mui-selected:focus": {
                backgroundColor: colors.grey[100],
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;
