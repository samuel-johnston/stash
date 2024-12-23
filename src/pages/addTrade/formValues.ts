import { AccountOption, Option } from "../../../electron/types";
import dayjs from "dayjs";

export interface AddTradeFormValues {
  asxcode: Option;
  type: "BUY" | "SELL";
  account: AccountOption;
  date: dayjs.Dayjs;
  quantity: string;
  unitPrice: string;
  brokerage: string;
}

export const initialValues: AddTradeFormValues = {
  asxcode: null,
  type: "BUY",
  account: null,
  date: dayjs(),
  quantity: "",
  unitPrice: "",
  brokerage: "",
};
