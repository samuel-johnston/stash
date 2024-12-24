import { getData, setData } from "./core";
import {
  changeFormat,
  currencyFormat,
  dayjsDate,
  precentFormat,
  writeLog,
} from "../utils";

// Yahoo-finance2
import yahooFinance from "yahoo-finance2";
import { QuoteField } from "yahoo-finance2/dist/esm/src/modules/quote";

// Dayjs
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Types
import {
  AccountOption,
  Company,
  GraphDataPoint,
  HistoricalEntry,
  Option,
  PortfolioData,
  PortfolioTableRow,
  PortfolioTableRowInternal,
} from "../types";

yahooFinance.setGlobalConfig({ queue: { concurrency: 16 } });
dayjs.extend(customParseFormat);

export interface PortfolioFilterValues {
  account: AccountOption;
  financialStatus: Option[];
  miningStatus: Option[];
  resources: Option[];
  products: Option[];
  recommendations: Option[];
}

interface State {
  units: number;     // How many units are currently held
  buyIndex: number;  // Current index we are up to in the company's buy history
  sellIndex: number; // Current index we are up to in the company's sell history
}

/**
 * Gets the data for the graph, table and text components using the given filter values.
 *
 * @param filterValues Provided values for filtering
 * @returns Data for each component
 */
export const getPortfolioData = async (filterValues: PortfolioFilterValues): Promise<PortfolioData> => {
  const companies = await getFilteredCompanies(filterValues);
  const emptyReturn = {
    graph: { 1: [], 3: [], 6: [], 12: [], 60: [] },
    table: [],
    text: {
      totalValue: "$0.00",
      dailyChange: "+0.00",
      dailyChangePerc: "0.00%",
      totalChange: "+0.00",
      totalChangePerc: "0.00%",
    },
  };

  // If no companies match the filter values
  if (companies.length === 0) {
    return emptyReturn;
  }

  const asxcodeArray = companies.map((entry) => entry.asxcode);
  const symbolArray = companies.map((entry) => `${entry.asxcode}.AX`);

  const fields: QuoteField[] = [
    "symbol",
    "regularMarketChangePercent",
    "regularMarketPrice",
    "regularMarketPreviousClose",
  ];

  // Don't await the quote API call (we can calculate the data points while request is pending)
  const quoteArrayPromise = yahooFinance.quote(symbolArray, { fields });
  const historicalData = await getHistoricalData(asxcodeArray);

  let dataPointId = 1;
  const dataPointsMap = new Map<string, GraphDataPoint>();

  let tableId = 1;
  const tableDataInternal: PortfolioTableRowInternal[] = [];

  // Calculate graph data using historical prices
  for (const company of companies) {
    // Get the historical for this company
    const historical = historicalData.find((entry) => entry.asxcode === company.asxcode);
    if (historical === undefined) {
      writeLog(`[getPortfolioData]: Skipped ${company.asxcode}. Could not fetch historical data.`);
      continue;
    }

    // Keep a state object that tracks as we iterate through historical entries
    const state: State = {
      units: 0,
      buyIndex: 0,
      sellIndex: 0,
    };

    // Update data points using historical entries
    for (const entry of historical.historical) {
      updateState(state, company, entry.date);

      // Value at the time of the entry
      const time = dayjs(entry.date).format("DD/MM/YYYY");
      const value = state.units * entry.adjClose;

      if (dataPointsMap.has(time)) {
        dataPointsMap.get(time).value += value;
        continue;
      }

      dataPointsMap.set(time, {
        id: dataPointId++,
        date: entry.date,
        value,
      });
    }

    let totalQuantity = 0;
    let totalCost = 0;
    let firstPurchaseDate = null;
    let lastPurchaseDate = null;
    let previousUnits = 0;

    for (const entry of company.currentShares) {
      // If entry matches account filter values
      if (filterValues.account.label === "All Accounts" || filterValues.account.accountId === entry.accountId) {
        const quantity = Number(entry.quantity);
        const unitPrice = Number(entry.unitPrice);
        const fees = Number(entry.brokerage) + Number(entry.gst);

        // Update totals
        totalQuantity += quantity;
        totalCost += (quantity * unitPrice) + fees;
        if (!dayjs().subtract(1, "day").isBefore(entry.date)) {
          previousUnits += quantity;
        }

        // Update dates
        if (firstPurchaseDate === null || dayjsDate(entry.date).isBefore(firstPurchaseDate)) {
          firstPurchaseDate = entry.date;
        }
        if (lastPurchaseDate === null || dayjsDate(entry.date).isAfter(lastPurchaseDate)) {
          lastPurchaseDate = entry.date;
        }
      }
    }

    // Don't add a row if no quantity
    if (totalQuantity > 0) {
      tableDataInternal.push({
        id: tableId++,
        asxcode: company.asxcode,
        units: totalQuantity,
        previousUnits,
        avgBuyPrice: totalCost / totalQuantity,
        purchaseCost: totalCost,
        firstPurchaseDate,
        lastPurchaseDate,
      });
    }
  }

  // Wait until quote API call is finished
  const quoteArray = await quoteArrayPromise;

  // Update data point for today using quote data
  let valueToday = 0;
  const today = dayjs().format("DD/MM/YYYY");
  for (const company of companies) {
    // Get the quote for this company
    const quote = quoteArray.find((entry) => entry.symbol === `${company.asxcode}.AX`);
    if (quote === undefined) {
      writeLog(`[getPortfolioData]: Skipped ${company.asxcode} in data point calculations. Could not find quote.`);
      continue;
    }

    const units = company.currentShares.reduce((sum, entry) => sum + Number(entry.quantity), 0);
    valueToday += units * quote.regularMarketPrice;
  }

  dataPointsMap.get(today).value = valueToday;

  let combinedValue = 0;
  let combinedPreviousValue = 0;
  let combinedCost = 0;

  const tableData: PortfolioTableRow[] = [];

  // Update rows using quote data
  for (const row of tableDataInternal) {
    // Get the quote for this company
    const quote = quoteArray.find((entry) => entry.symbol === `${row.asxcode}.AX`);
    if (quote === undefined) {
      writeLog(`[getPortfolioData]: Skipped ${row.asxcode} in row calculations. Could not find quote.`);
      continue;
    }

    // Check that all fields were received
    const missingFields = fields.filter((field) => !Object.prototype.hasOwnProperty.call(quote, field));
    if (missingFields.length > 0) {
      writeLog(`[getPortfolioData]: Skipped ${row.asxcode} in row calculations. Missing following fields [${missingFields.join(", ")}].`);
      continue;
    }

    const {
      id,
      asxcode,
      units,
      avgBuyPrice,
      purchaseCost,
      firstPurchaseDate,
      lastPurchaseDate,
      previousUnits,
    } = row;

    const currentPrice = quote.regularMarketPrice;
    const previousPrice = quote.regularMarketPreviousClose;
    const dailyChangePerc = quote.regularMarketChangePercent;

    // Update combined totals
    combinedPreviousValue += previousPrice * previousUnits;
    combinedValue += currentPrice * units;
    combinedCost += purchaseCost;

    const marketValue = currentPrice * units;
    const profitOrLoss = marketValue - purchaseCost;
    const profitOrLossPerc = profitOrLoss / purchaseCost * 100;
    const dailyProfit = units * (currentPrice - previousPrice);

    tableData.push({
      id,
      asxcode,
      units,
      avgBuyPrice,
      currentPrice,
      marketValue,
      purchaseCost,
      dailyChangePerc,
      dailyProfit,
      profitOrLoss,
      profitOrLossPerc,
      firstPurchaseDate,
      lastPurchaseDate,
      weightPerc: null, // Calculated after all rows are done
    });
  }

  // Once all table rows have been added, calculate the weight of each row
  for (const row of tableData) {
    row.weightPerc = row.marketValue / combinedValue * 100;
  }

  // Calculate text component fields
  const dailyChange = combinedValue - combinedPreviousValue;
  const dailyChangePerc = (combinedPreviousValue !== 0) ? dailyChange / combinedPreviousValue * 100 : null;
  const totalChange = combinedValue - combinedCost;
  const totalChangePerc = (combinedCost !== 0) ? totalChange / combinedCost * 100 : null;

  const graphData: Record<1 | 3 | 6 | 12 | 60, GraphDataPoint[]> = {
    1: [],  // last 1 month
    3: [],  // last 3 months
    6: [],  // last 6 months
    12: [], // last 12 months (1 year)
    60: [], // last 60 months (5 years)
  };

  // Extract the data points from the map into the graphData object
  let allZero = true;
  dataPointsMap.forEach((dataPoint) => {
    if (allZero && dataPoint.value !== 0) {
      allZero = false;
    }

    [1, 3, 6, 12].forEach((months) => {
      if (dayjs().subtract(months, "month").isBefore(dataPoint.date, "day")) {
        graphData[months].push(dataPoint);
      }
    });

    // 5 year interval only uses 1 data point per week (otherwise too many points)
    if (new Date(dataPoint.date).getDay() == 1 || dayjs().isSame(dataPoint.date, "day")) {
      graphData[60].push(dataPoint);
    }
  });

  // If all data points are 0, don't show points on graph
  if (allZero) {
    graphData[1] = [];
    graphData[3] = [];
    graphData[6] = [];
    graphData[12] = [];
    graphData[60] = [];
  }

  return {
    graph: graphData,
    table: tableData,
    text: {
      totalValue: currencyFormat(combinedValue),
      dailyChange: changeFormat(dailyChange),
      dailyChangePerc: precentFormat(dailyChangePerc).replace("-", ""),
      totalChange: changeFormat(totalChange),
      totalChangePerc: precentFormat(totalChangePerc).replace("-", ""),
    },
  };
};

/**
 * Searches the given `arr` array and checks if all options in the
 * `target` array is found.
 *
 * @param target Array of targets
 * @param arr Array to check for targets
 * @returns Whether all targets were found
 */
const filterOption = (target: Option[], arr: Option[]) => {
  return target.every((val) => arr.some((obj) => obj.label === val.label));
};

/**
 * Returns the companies that match the filter values.
 *
 * @param filterValues Provided values for filtering
 * @returns Array of companies matching all filter values
 */
const getFilteredCompanies = async (filterValues: PortfolioFilterValues) => {
  // Check account is provided
  if (filterValues.account === null) return [];

  const data = await getData("companies");
  return data.filter((entry) =>
    filterOption(filterValues.financialStatus, entry.financialStatus)
    && filterOption(filterValues.miningStatus, entry.miningStatus)
    && filterOption(filterValues.resources, entry.resources)
    && filterOption(filterValues.products, entry.products)
    && filterOption(filterValues.recommendations, entry.recommendations) && (
      filterValues.account.label === "All Accounts"
      || entry.currentShares.some((obj) => obj.accountId === filterValues.account.accountId)
    ),
  );
};

/**
 * A helper function that gets the historical data from storage, fetching new
 * data if any asxcodes are outdated or missing from the data. The new data is
 * saved to storage, and returned from this function.
 *
 * @param asxcodes Array of ASX codes
 * @returns Array containing historical adjusted close prices for all the given ASX codes
 */
const getHistoricalData = async (asxcodes: string[]) => {
  const data = await getData("historicals");

  // Missing asxcodes (not found in the storage file)
  const existing = new Set(data.map((entry) => entry.asxcode));
  const missing = asxcodes.filter((asxcode) => !existing.has(asxcode));

  // Outdated asxcodes (haven't been updated today)
  const outdated = data
    .filter((entry) => !dayjsDate(entry.lastUpdated).isSame(dayjs(), "day"))
    .map((entry) => entry.asxcode);

  // Update data using only missing and outdated asxcodes
  const needUpdate = [...missing, ...outdated];

  // If no updates needed, can return early
  if (needUpdate.length === 0) return data;

  const queryOptions = {
    period1: dayjs().subtract(5, "year").toDate(),
    interval: "1d" as const,
  };

  // Send chart requests in parallel
  const responseArray = await Promise.allSettled(needUpdate.map(async (asxcode) => {
    const chart = await yahooFinance.chart(`${asxcode}.AX`, queryOptions);
    const historical = chart.quotes;
    return { asxcode, historical };
  }));

  const lastUpdated = dayjs().format("DD/MM/YYYY hh:mm A");
  for (const response of responseArray) {
    if (response.status === "fulfilled") {
      // Keep daily data for entries <1 year ago, and only weekly data for entries >1 year ago
      const asxcode = response.value.asxcode;
      const filteredHistoricals = response.value.historical
        .filter((entry) => dayjs().diff(entry.date, "year") < 1 || entry.date.getDay() == 1);

      const historical: HistoricalEntry[] = [];
      for (const entry of filteredHistoricals) {
        const date = dayjs(entry.date).format("DD/MM/YYYY");

        // Check that adjClose field is present
        if (!("adjclose" in entry)) {
          writeLog(`[getHistoricalData]: Skipped a historical entry on ${date} for ${asxcode}. Missing 'adjclose' field.`);
          continue;
        }

        // Check that there is not already an historical for the date (to prevent duplicate entries for the same day)
        if (historical.some((hist) => dayjs(hist.date).isSame(entry.date, "day"))) {
          writeLog(`[getHistoricalData]: Skipped a historical entry on ${date} for ${asxcode}. Entry already exists for this date.`);
          continue;
        }

        historical.push({ adjClose: entry.adjclose, date: entry.date });
      }

      const existingEntry = data.find((entry) => entry.asxcode === response.value.asxcode);
      if (existingEntry !== undefined) {
        existingEntry.lastUpdated = lastUpdated;
        existingEntry.historical = historical;
      }
      else {
        data.push({ asxcode, lastUpdated, historical });
      }

      writeLog(`[getHistoricalData]: Successfully updated historical data for ${asxcode}.AX.`);
    }
    else {
      writeLog(`[getHistoricalData]: A historical request could not be fulfilled [${response.reason}].`);
    }
  }

  setData("historicals", data);
  return data;
};

/**
 * A helper function that updates the given state object.
 */
const updateState = (state: State, company: Company, time: Date) => {
  // First update using buy history
  while (state.buyIndex < company.buyHistory.length) {
    const entry = company.buyHistory[state.buyIndex];
    if (!dayjsDate(entry.date).isBefore(time)) {
      break;
    }
    state.units += Number(entry.quantity);
    state.buyIndex++;
  }

  // Then update using sell history
  while (state.sellIndex < company.sellHistory.length) {
    const entry = company.sellHistory[state.sellIndex];
    if (!dayjsDate(entry.sellDate).isBefore(time)) {
      break;
    }
    state.units -= Number(entry.quantity);
    state.sellIndex++;
  }
};
