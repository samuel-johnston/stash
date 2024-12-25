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
import {
  QuoteField,
  QuoteResponseArray,
} from "yahoo-finance2/dist/esm/src/modules/quote";

// Dayjs
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Types
import {
  AccountOption,
  Company,
  GraphDataPoint,
  GraphRange,
  Historical,
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

// A state essentially keeps track of fields as we iterate through historical entries
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

  // Wait until historical data is fetched
  let historicalData: Historical[];
  try {
    historicalData = await getHistoricalData(asxcodeArray);
  }
  catch (error) {
    writeLog(`[getHistoricalData]: Could not continue as a yahooFinance.chart() failed. [${error.name}]: ${error.message}`);
    return emptyReturn;
  }

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

    const state: State = {
      units: 0,
      buyIndex: 0,
      sellIndex: 0,
    };

    // Update data points using historical entries
    for (const entry of historical.historical) {
      updateState(state, company, entry.date);

      // Value at the date of the entry
      const date = dayjs(entry.date).format("DD/MM/YYYY");
      const value = state.units * entry.adjClose;

      if (dataPointsMap.has(date)) {
        dataPointsMap.get(date).value += value;
        continue;
      }

      dataPointsMap.set(date, {
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

  // Wait until quote API call is fetched
  let quoteArray: QuoteResponseArray;
  try {
    quoteArray = await quoteArrayPromise;
  }
  catch (error) {
    writeLog(`[getPortfolioData]: Could not continue as yahooFinance.quote() failed. [${error.name}]: ${error.message}`);
    return emptyReturn;
  }

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

  if (dataPointsMap.has(today)) {
    dataPointsMap.get(today).value = valueToday;
  }
  else {
    dataPointsMap.set(today, {
      id: dataPointId++,
      date: dayjs().toDate(),
      value: valueToday,
    });
  }

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

  // Convert map into sorted array
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dataPointsArray = Array.from(dataPointsMap, ([key, value]) => value)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const graphData: Record<GraphRange, GraphDataPoint[]> = { 1: [], 3: [], 6: [], 12: [], 60: [] };

  // Distribute the data points into the graphData object
  dataPointsArray.forEach((dataPoint) => {
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

  const companies = await getData("companies");
  return companies.filter((company) =>
    ((filterValues.account.label === "All Accounts" && company.buyHistory.length > 0)
      || company.buyHistory.some((entry) => entry.accountId === filterValues.account.accountId))
    && filterOption(filterValues.financialStatus, company.financialStatus)
    && filterOption(filterValues.miningStatus, company.miningStatus)
    && filterOption(filterValues.resources, company.resources)
    && filterOption(filterValues.products, company.products)
    && filterOption(filterValues.recommendations, company.recommendations),
  );
};

/**
 * A helper function that gets the historical data from storage, fetching new
 * data if any asxcodes are outdated or missing from the data. The new data is
 * saved to storage, and returned from this function.
 *
 * @param asxcodes Array of ASX codes
 * @returns Array containing historical adjusted close prices for all the given ASX codes
 * @throws If any yahooFinance.chart() call fails.
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

  // Send requests in parallel
  await Promise.all(needUpdate.map(async (asxcode) => {
    const chart = await yahooFinance.chart(`${asxcode}.AX`, queryOptions);
    const historical = chart.quotes
      .filter((entry) => new Date(entry.date).getDay() == 1 || dayjs().subtract(1, "year").isBefore(entry.date));

    const historicalMap = new Map<string, HistoricalEntry>();
    for (const entry of historical) {
      const date = dayjs(entry.date).format("DD/MM/YYYY");

      // Check that adjClose field is present
      if (!("adjclose" in entry)) {
        writeLog(`[getHistoricalData]: Skipped a historical entry on ${date} for ${asxcode}. Missing 'adjclose' field.`);
        continue;
      }

      // Check that there is not already an historical for the date (to prevent duplicate entries for the same day)
      if (historicalMap.has(date)) {
        writeLog(`[getHistoricalData]: Skipped a historical entry on ${date} for ${asxcode}. Entry already exists for this date.`);
        continue;
      }

      historicalMap.set(date, {
        adjClose: entry.adjclose,
        date: entry.date,
      });
    }

    // Convert map into array
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const historicalArray = Array.from(historicalMap, ([key, value]) => value);

    // Update data with new historicals
    const lastUpdated = dayjs().format("DD/MM/YYYY hh:mm A");
    const existingHistorical = data.find((entry) => entry.asxcode === asxcode);
    if (existingHistorical !== undefined) {
      existingHistorical.lastUpdated = lastUpdated;
      existingHistorical.historical = historicalArray;
    }
    else {
      data.push({
        asxcode,
        lastUpdated,
        historical: historicalArray,
      });
    }

    writeLog(`[getHistoricalData]: Successfully updated historical data for ${asxcode}.AX.`);
  }));

  setData("historicals", data);
  return data;
};

/**
 * A helper function that updates the given state object.
 */
const updateState = (state: State, company: Company, currDate: Date) => {
  // First update using buy history
  while (state.buyIndex < company.buyHistory.length) {
    const entry = company.buyHistory[state.buyIndex];
    if (!dayjsDate(entry.date).isBefore(currDate)) {
      break;
    }
    state.units += Number(entry.quantity);
    state.buyIndex++;
  }

  // Then update using sell history
  while (state.sellIndex < company.sellHistory.length) {
    const entry = company.sellHistory[state.sellIndex];
    if (!dayjsDate(entry.sellDate).isBefore(currDate)) {
      break;
    }
    state.units -= Number(entry.quantity);
    state.sellIndex++;
  }
};
