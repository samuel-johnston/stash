import { AddCompanyFormValues } from "./index";
import { enqueueSnackbar } from "notistack";

const handleFormSubmit = async (values: AddCompanyFormValues) => {
  // Convert Dayjs objects to strings (since can't send "Dayjs" types over IPC)
  const sendValues = {
    ...values,
    noteDate: values.noteDate.format("DD/MM/YYYY hh:mm A"),
    notificationDate: values.notificationDate.format("DD/MM/YYYY hh:mm A"),
  };

  await window.electronAPI.addCompany(sendValues);
  enqueueSnackbar(`${values.asxcode.toUpperCase()} successfully added!`, { variant: "success" });
};

export default handleFormSubmit;
