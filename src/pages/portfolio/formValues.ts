import { AccountOption, Option } from "../../../electron/types";

export interface PortfolioFormValues {
  account: AccountOption;
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
}

export const initialValues: PortfolioFormValues = {
  account: { label: "All Accounts" },
  financialStatus: [],
  miningStatus: [],
  resources: [],
  products: [],
  recommendations: [],
};
