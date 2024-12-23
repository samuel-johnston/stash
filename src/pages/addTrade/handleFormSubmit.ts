import { AddTradeFormValues } from "./formValues";
import { enqueueSnackbar } from "notistack";

const handleFormSubmit = async (values: AddTradeFormValues, gstPercent: string) => {
  // Convert dates Dayjs objects to strings (since can't send "Dayjs" types over IPC)
  const sendValues = { ...values, date: values.date.format("DD/MM/YYYY hh:mm A") };

  const method = (values.type === "BUY"
    ? window.electronAPI.buyShare
    : window.electronAPI.sellShare);

  try {
    await method(sendValues, gstPercent);
    enqueueSnackbar(`Trade successfully added!`, { variant: "success" });
  }
  catch (error) {
    // If IPC threw an error...
    // Split message since Electron wraps the original error message with additional text.
    const splitMsg = error.message.split("Error: ");
    const msg = (splitMsg.length === 2) ? splitMsg[1] : error.message;
    enqueueSnackbar(msg, { variant: "error" });
  }
};

export default handleFormSubmit;
