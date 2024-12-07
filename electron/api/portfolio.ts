import { getData, setData } from "./core";
import { writeLog } from "./logs";
import {
  changeFormat,
  currencyFormat,
  dayjsDate,
  precentFormat,
} from "./format";

// Yahoo-finance2
import yahooFinance from "yahoo-finance2";
import { QuoteField } from "yahoo-finance2/dist/esm/src/modules/quote";

// Dayjs
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Types
import {
  AccountOption,
  Company,
  GraphDataPoint,
  HistoricalEntry,
  Option,
  PortfolioData,
  PortfolioFilterValues,
  PortfolioTableRow,
} from "../types";

yahooFinance.setGlobalConfig({ queue: { concurrency: 16 } });
dayjs.extend(customParseFormat);

/**
 * Gets the data for the graph, table and text components using the given filter values.
 * @param filterValues Provided values for filtering
 * @returns Data for each component
 */
export const getPortfolioData = async (filterValues: PortfolioFilterValues): Promise<PortfolioData> => {
  const companies = getFilteredCompanies(filterValues);

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

  const quoteArray = await yahooFinance.quote(symbolArray, { fields });
  const historicalData = await getHistoricalData(asxcodeArray);

  let graphId = 1;
  let tableId = 1;
  const graphData: GraphDataPoint[] = [];
  const tableData: PortfolioTableRow[] = [];

  let combinedValue = 0;
  let combinedPreviousValue = 0;
  let combinedCost = 0;

  for (const company of companies) {
    // Get the quote for this company
    const quote = quoteArray.find((entry) => entry.symbol === `${company.asxcode}.AX`);
    if (quote === undefined) {
      writeLog(`[getPortfolioData]: Skipped ${company.asxcode}. Could not fetch quote.`);
      continue;
    }

    // Check that all fields were received
    const missingFields = fields.filter((field) => !Object.prototype.hasOwnProperty.call(quote, field));
    if (missingFields.length > 0) {
      writeLog(`[getPortfolioData]: Skipped ${company.asxcode}. Missing following fields [${missingFields.join(", ")}].`);
      continue;
    }

    // Get the historicals for this company
    const historicalEntry = historicalData.find((entry) => entry.asxcode === company.asxcode);
    if (historicalEntry === undefined) {
      writeLog(`[getPortfolioData]: Skipped ${company.asxcode}. Could not fetch historical data.`);
      continue;
    }

    // Calculate graph data using historical prices
    for (const historical of historicalEntry.historical) {
      // If historical date is today, don't add an entry as one
      // will be added later using more recent quote data instead
      if (dayjs().isSame(historical.date, "day")) continue;

      // Calculate the value at the time of the historical entry
      const time = dayjs(historical.date);
      const units = countUnitsAtTime(company, filterValues.account, time);
      const value = units * historical.adjClose;

      graphData.push({
        id: graphId++,
        date: time.toDate(),
        value,
      });
    }

    let totalQuantity = 0;
    let totalCost = 0;
    let firstPurchaseDate = null;
    let lastPurchaseDate = null;

    // Calculate total quantity and cost for the portfolio
    for (const shareEntry of company.currentShares) {
      // Only add entry if account matches filtered values.
      if (filterValues.account.label === "All Accounts" || filterValues.account.accountId === shareEntry.accountId) {
        const quantity = Number(shareEntry.quantity);
        const unitPrice = Number(shareEntry.unitPrice);
        const fees = Number(shareEntry.brokerage) + Number(shareEntry.gst);

        // Update totals
        totalQuantity += quantity;
        totalCost += (quantity * unitPrice) + fees;

        // Update dates
        if (firstPurchaseDate === null || dayjsDate(shareEntry.date).isBefore(firstPurchaseDate)) {
          firstPurchaseDate = shareEntry.date;
        }
        if (lastPurchaseDate === null || dayjsDate(shareEntry.date).isAfter(lastPurchaseDate)) {
          lastPurchaseDate = shareEntry.date;
        }
      }
    }

    // Don't add a row if no quantity
    if (totalQuantity > 0) {
      const currentPrice = quote.regularMarketPrice;
      const previousPrice = quote.regularMarketPreviousClose;
      const previousUnits = countUnitsAtTime(company, filterValues.account, dayjs().subtract(1, "day"));

      // Update combined totals
      combinedPreviousValue += previousPrice * previousUnits;
      combinedValue += currentPrice * totalQuantity;
      combinedCost += totalCost;

      // Calculate row values
      const avgBuyPrice = totalCost / totalQuantity;
      const marketValue = currentPrice * totalQuantity;
      const profitOrLoss = marketValue - totalCost;
      const profitOrLossPerc = profitOrLoss / totalCost * 100;
      const dailyProfit = totalQuantity * (currentPrice - previousPrice);

      // Add row to table data
      tableData.push({
        id: tableId++,
        asxcode: company.asxcode,
        units: totalQuantity,
        avgBuyPrice,
        currentPrice,
        marketValue,
        purchaseCost: totalCost,
        dailyChangePerc: quote.regularMarketChangePercent,
        dailyProfit,
        profitOrLoss,
        profitOrLossPerc,
        firstPurchaseDate,
        lastPurchaseDate,
        weightPerc: null, // Calculated after all rows are done
      });

      // Add today's value to the graph data
      const graphEntry = graphData.find((entry) => dayjs().isSame(entry.date, "day"));
      if (graphEntry === undefined) {
        graphData.push({
          id: graphId++,
          date: dayjs().toDate(),
          value: marketValue,
        });
      }
      else {
        graphEntry.value += marketValue;
      }
    }
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

  // If all data points are 0, same as no data
  if (graphData.every((entry) => entry.value === 0)) {
    return emptyReturn;
  }

  return {
    graph: {
      1: graphData.filter((entry) => dayjs().subtract(1, "month").isBefore(entry.date, "day")),
      3: graphData.filter((entry) => dayjs().subtract(3, "month").isBefore(entry.date, "day")),
      6: graphData.filter((entry) => dayjs().subtract(6, "month").isBefore(entry.date, "day")),
      12: graphData.filter((entry) => dayjs().subtract(12, "month").isBefore(entry.date, "day")),
      60: graphData.filter((entry) => entry.date.getDay() == 1 || dayjs().isSame(entry.date, "day")),
    },
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
const getFilteredCompanies = (filterValues: PortfolioFilterValues): Company[] => {
  // Check account is provided
  if (filterValues.account === null) return [];

  const data = getData("companies");
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
 * A helper function that counts the number of units the account held at the given
 * time (assumed to be in the past).
 *
 * @param company Object containing the company data
 * @param account Which account to check
 * @param time dayjs object of the required time (assumed to be in the past)
 * @returns Number of units
 */
const countUnitsAtTime = (company: Company, account: AccountOption, time: Dayjs) => {
  const unitsBrought = company.buyHistory.reduce((total, entry) => {
    if (account.label === "All Accounts" || account.accountId === entry.accountId) {
      if (dayjsDate(entry.date).isBefore(time)) {
        total += Number(entry.quantity);
      }
    }
    return total;
  }, 0);

  const unitsSold = company.sellHistory.reduce((total, entry) => {
    if (account.label === "All Accounts" || account.accountId === entry.accountId) {
      if (dayjsDate(entry.sellDate).isBefore(time)) {
        total += Number(entry.quantity);
      }
    }
    return total;
  }, 0);

  return unitsBrought - unitsSold;
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
  const data = getData("historicals");

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

        // Check that there is not already an historical for the date (to prevent duplicate historicals for the same day)
        if (historical.find((hist) => dayjs(hist.date).isSame(entry.date, "day"))) {
          writeLog(`[getHistoricalData]: Skipped a historical entry on ${date} for ${asxcode}. Entry already exists for this date.`);
          continue;
        }

        historical.push({ adjClose: entry.adjclose, date: entry.date });
      }

      const existingEntry = data.find((entry) => entry.asxcode === response.value.asxcode);
      if (existingEntry === undefined) {
        data.push({ asxcode, lastUpdated, historical });
      }
      else {
        existingEntry.lastUpdated = lastUpdated;
        existingEntry.historical = historical;
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
