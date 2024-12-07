import { AddCompanyFormValues } from "../src/pages/addCompany";
import { AddTradeFormValues } from "../src/pages/addTrade";

export { PortfolioFormValues as PortfolioFilterValues } from "../src/pages/portfolio";

// Valid option keys, used for company details
export type OptionKey =
  | "financialStatus"
  | "miningStatus"
  | "monitor"
  | "products"
  | "recommendations"
  | "resources";

// All valid keys
export type Key =
  | OptionKey
  | "countries"
  | "accounts"
  | "companies"
  | "historicals"
  | "settings";

// Dropdown option type
export interface Option {
  label: string; // Text that is displayed for the option
  inputValue?: string; // For dynamically made options "Add [inputValue]"
}

export interface AccountOption extends Option {
  accountId?: string;
}

export interface Country {
  label: string;
  code: string;
  phone: string;
  suggested?: boolean;
}

export interface Account {
  name: string;
  accountId: string;
  created: string;
}

export interface Note {
  title: string;
  date: string;
  description: string;
}

export interface DateNotification {
  title: string;
  date: string;
}

export interface PriceNotification {
  title: string;
  highPrice: string;
  lowPrice: string;
}

// Return type from validateASXCode()
export interface ValidateASXReturn {
  status: string;
  companyName: string;
  unitPrice: string;
}

export interface CurrentShareEntry {
  accountId: string; // Account id that owns the share
  date: string; // Date of when the shares were originally brought
  quantity: string; // Number of current outstanding shares
  unitPrice: string; // Price paid for 1 share at the time of purchase
  brokerage: string; // Remaining brokerage for the trade
  gst: string; // Remaining GST for the trade
}

export interface BuyHistoryEntry {
  accountId: string; // Account id that brought the share
  date: string; // Date of when the shares were brought
  quantity: string; // Number of shares brought
  unitPrice: string; // Price paid for 1 share at the time of purchase
  brokerage: string; // Brokerage paid for the trade
  gst: string; // GST paid for the trade
  total: string; // Total amount paid for the trade
}

export interface SellHistoryEntry {
  accountId: string; // Account id that sold the share
  buyDate: string; // Date of when the shares were brought
  sellDate: string; // Date of when the shares were sold
  quantity: string; // Number of shares sold
  buyPrice: string; // Price paid for 1 share at the time of purchase
  sellPrice: string; // Price sold for 1 share at the time of sale
  appliedBuyBrokerage: string; // Proportion of brokerage paid when brought
  appliedSellBrokerage: string; // Proportion of brokerage paid when sold
  appliedBuyGst: string; // Proportion of GST paid when brought
  appliedSellGst: string; // Proportion of GST paid when sold
  total: string; // Total amount received for the trade (negative = loss)
  profitOrLoss: string; // Profit/loss made from the trade (includes brokerage and GST fees)
  capitalGainOrLoss: string; // Capital gain/loss made by trade (positive = gain, negative = loss)
  cgtDiscount: boolean; // Whether the CGT discount (50%) was applied to the capital gain.
}

export interface Company {
  asxcode: string;
  operatingCountries: Country[];
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
  monitor: Option[];
  reasonsToBuy: string;
  reasonsNotToBuy: string;
  positives: string;
  negatives: string;
  notes: Note[];
  dateNotifications: DateNotification[];
  priceNotifications: PriceNotification[];
  currentShares: CurrentShareEntry[];
  buyHistory: BuyHistoryEntry[];
  sellHistory: SellHistoryEntry[];
}

export interface Settings {
  unitPriceAutoFill: boolean;
  gstPercent: string;
  brokerageAutoFill: string;
}

export interface HistoricalEntry {
  adjClose: number;
  date: Date;
}

export interface Historical {
  asxcode: string;
  lastUpdated: string;
  historical: HistoricalEntry[];
}

// Values type for AddCompany()
// Override dates with type "string" instead of type "Dayjs" (since can't send "Dayjs" types over IPC)
export interface AddCompanyValues extends Omit<AddCompanyFormValues, "noteDate" | "notificationDate"> {
  noteDate: string;
  notificationDate: string;
}

// Values type for BuyShares() and SellShares()
// Override dates with type "string" instead of type "Dayjs" (since can't send "Dayjs" types over IPC)
export interface AddTradeValues extends Omit<AddTradeFormValues, "date"> {
  date: string;
}

export interface PortfolioTableRow {
  id: number; // ID, eg. 1, 2, 3, ...
  asxcode: string; // ASX code of the company
  units: number; // Number of units owned
  avgBuyPrice: number; // Average price of brought shares
  currentPrice: number; // Last share price
  marketValue: number; // Market value using last share price
  purchaseCost: number; // Purchase cost of all units
  dailyChangePerc: number; // Daily change in share price %
  dailyProfit: number; // Daily change in profit
  profitOrLoss: number; // Profit/loss amount
  profitOrLossPerc: number; // Profit/loss %
  firstPurchaseDate: string; // Earliest purchase date of current shares
  lastPurchaseDate: string; // Latest purchast date of current shares
  weightPerc: number; // Weight % using market value
}

export type GraphDataPoint = {
  id: number;
  date: Date;
  value: number;
};

// Graph range in months
export const graphRanges = [1, 3, 6, 12, 60] as const;
export type GraphRange = typeof graphRanges[number];

// Return type of getPortfolioData()
export interface PortfolioData {
  graph: Record<GraphRange, GraphDataPoint[]>;
  table: PortfolioTableRow[];
  text: PortfolioText;
}

export interface PortfolioText {
  totalValue: string; // Total value of the portfolio (as of today)
  dailyChange: string; // Today's change in portfolio value
  dailyChangePerc: string; // Today's change in portfolio value %
  totalChange: string; // Total change in portfolio value
  totalChangePerc: string; // Total change in portfolio value %
}
