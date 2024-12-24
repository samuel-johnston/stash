import { Country, Option } from "../../../electron/types";
import dayjs from "dayjs";

export interface AddCompanyFormValues {
  asxcode: string;
  operatingCountries: Country[];
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
  monitor: Option[];
  noteTitle: string;
  noteDate: dayjs.Dayjs;
  noteDescription: string;
  noteToBuy: string;
  noteNotToBuy: string;
  notePositives: string;
  noteNegatives: string;
  notificationDateTitle: string;
  notificationDate: dayjs.Dayjs;
  notificationPriceTitle: string;
  notificationPriceHigh: string;
  notificationPriceLow: string;
}

export const initialValues: AddCompanyFormValues = {
  asxcode: "",
  operatingCountries: [],
  financialStatus: [],
  miningStatus: [],
  resources: [],
  products: [],
  recommendations: [],
  monitor: [],
  noteTitle: "",
  noteDate: dayjs(), // Today's date
  noteDescription: "",
  noteToBuy: "",
  noteNotToBuy: "",
  notePositives: "",
  noteNegatives: "",
  notificationDateTitle: "",
  notificationDate: dayjs().add(1, "week"), // Date in 1 week
  notificationPriceTitle: "",
  notificationPriceHigh: "",
  notificationPriceLow: "",
};
