import { Quote } from 'yahoo-finance2/dist/esm/src/modules/quote';
import dayjs from 'dayjs';

import { Account, AccountData, Historical, Security } from '@types';
import { getData, getHistoricalData, setData } from '@storage';
import { dayjsParse } from '@utils';
import { writeLog } from '@logs';

import { QuoteService } from '../quotes';

interface AccountDataInternal {
  name: string;
  accountId: string;
  todayChange: number;
  realisedProfitOrLoss: number;
  realisedTotal: number;
  marketValue: number;
  totalCost: number;
}

/**
 * Gets the data for the "Accounts" page.
 */
export const getAccountData = async () => {
  const assembler = new AccountDataAssembler();
  return await assembler.assemble();
};

/**
 * Generates a random id that is exactly 7 digits long.
 */
const generateId = () => Math.floor(1000000 + Math.random() * 9000000).toString();

/**
 * Creates a new account with the given `name`.
 *
 * @param name Name of the account
 */
export const createAccount = async (name: string) => {
  const accounts = await getData('accounts');

  let accountId = generateId();
  while (accounts.has(accountId)) {
    accountId = generateId();
  }

  accounts.set(accountId, { name, accountId });

  await setData('accounts', accounts);
};

/**
 * Renames the account related to the given `accountId`.
 *
 * @param name The new name of the account
 * @param accountId Id of the account
 */
export const renameAccount = async ({ name, accountId }: Account) => {
  const accounts = await getData('accounts');

  // Check account id is found
  const account = accounts.get(accountId);
  if (account === undefined) {
    throw new Error(`ERROR: Could not find account id ${accountId}`);
  }

  account.name = name;

  await setData('accounts', accounts);
};

/**
 * Deletes the account related to the given `accountId`. Also removing any trades
 * associated with the account.
 *
 * @param accountId Id of the account
 */
export const deleteAccount = async (accountId: string) => {
  const accounts = await getData('accounts');
  accounts.delete(accountId);

  // Delete all data relating to the account
  const securities = await getData('securities');
  for (const security of securities.values()) {
    security.holdings = security.holdings.filter((entry) => entry.accountId !== accountId);
    security.buyHistory = security.buyHistory.filter((entry) => entry.accountId !== accountId);
    security.sellHistory = security.sellHistory.filter((entry) => entry.accountId !== accountId);
  }

  await setData('accounts', accounts);
  await setData('securities', securities);
};

class AccountDataAssembler extends QuoteService {
  private securities: Map<string, Security>;
  private accounts: Map<string, Account>;
  private accountDataMap = new Map<string, AccountDataInternal>();
  private historicals: Map<string, Historical>;

  /**
   * Assembes an array of `AccountData` objects.
   */
  public async assemble() {
    this.setTargetCurrency((await getData('settings')).currency);
    this.securities = await getData('securities');
    this.accounts = await getData('accounts');

    for (const account of this.accounts.values()) {
      this.accountDataMap.set(account.accountId, {
        name: account.name,
        accountId: account.accountId,
        todayChange: 0,
        realisedProfitOrLoss: 0,
        realisedTotal: 0,
        marketValue: 0,
        totalCost: 0,
      });
    }

    // Ignore symbols with no data
    const securitySymbols = Array.from(this.securities.values())
      .filter((security) => security.buyHistory.length > 0 || security.sellHistory.length > 0 || security.holdings.length > 0)
      .map((security) => security.symbol);

    // If no symbols, can return early
    if (securitySymbols.length === 0) {
      return this.getResult();
    }

    // Fetch historical data for all securities
    try {
      this.historicals = await getHistoricalData(securitySymbols);
    } catch (error) {
      writeLog(`[AccountDataAssembler.assemble()]: Could not continue as a yahooFinance.chart() failed: ${error.message}`);
      return this.getResult();
    }

    const currencyCodes = new Set(this.historicals.values().map((historical) => historical.currency));
    const quoteDataRequest = this.requestQuoteData(securitySymbols, Array.from(currencyCodes));

    // While quote data is fetching, we can process realised profit/loss since it doesn't rely on quote data.
    this.processRealisedProfitOrLoss();

    // Wait until quote request is fetched
    try {
      await quoteDataRequest;
    } catch (error) {
      writeLog(`[AccountDataAssembler.assemble()]: Could not continue as yahooFinance.quote() failed: ${error.message}`);
      return this.getResult();
    }

    this.processDataWithQuotes();

    return this.getResult();
  }

  /**
   * Processes realised profit/loss and adds it into `this.accountData`.
   */
  private processRealisedProfitOrLoss() {
    for (const security of this.securities.values()) {
      for (const entry of security.sellHistory) {
        const accountData = this.accountDataMap.get(entry.accountId);
        if (accountData === undefined) {
          writeLog(`[AccountDataAssembler.processRealisedProfitOrLoss]: Skipped a sell history entry `
            + `for ${security.symbol} with account id ${entry.accountId}. Account data was not found.`);
          continue;
        }

        accountData.realisedTotal += entry.total;
        accountData.realisedProfitOrLoss += entry.profitOrLoss;
      }
    }
  }

  /**
   * Processes the rest of the `AccountDataInternal` fields using quote data, and adds it into `this.accountData`.
   */
  private processDataWithQuotes() {
    for (const security of this.securities.values()) {
      // We can skip securities with no holdings (doesn't affect totals)
      if (security.holdings.length === 0) {
        continue;
      }

      let quote: Quote;
      let rate: number;
      let previousRate: number;
      try {
        ({ quote, rate, previousRate } = this.getQuote(security.symbol));
      } catch (error) {
        writeLog(`[AccountDataAssembler.processDataWithQuotes]: Skipping ${security.symbol}: ${error.message}`);
        continue;
      }

      // Safe deconstruction (fields checked prior in this.getQuote())
      const previousPrice = quote.regularMarketPreviousClose!;
      const lastPrice = quote.regularMarketPrice!;

      for (const holding of security.holdings) {
        const accountData = this.accountDataMap.get(holding.accountId);
        if (accountData === undefined) {
          writeLog(`[AccountDataAssembler.processDataWithQuotes]: Skipped a holding for `
            + `${security.symbol} with account id ${holding.accountId}. Account data was not found.`);
          continue;
        }

        const { quantity, price: buyPrice, brokerage, gst } = holding;

        // If the holding was owned before today, use previous price, otherwise use the original buy price
        accountData.todayChange += dayjsParse(holding.date).isBefore(dayjs(), 'day')
          ? (lastPrice * quantity * rate) - (previousPrice * quantity * previousRate)
          : (lastPrice * quantity * rate) - (buyPrice * quantity * previousRate);

        accountData.marketValue += lastPrice * quantity * rate;
        accountData.totalCost += (buyPrice * quantity + brokerage + gst) * rate; // TODO USE RATE AT PURCHASE
      }
    }
  }

  /**
   * Returns an array of `AccountData` from the map of `AccountDataInternal`.
   * Calculates the remaining fields necessary for the `AccountData` type.
   */
  private getResult(): AccountData[] {
    return Array.from(this.accountDataMap.values()).map((entry) => {
      const {
        name,
        accountId,
        todayChange,
        realisedProfitOrLoss,
        realisedTotal,
        marketValue,
        totalCost,
      } = entry;

      const unrealisedProfitOrLoss = marketValue - totalCost;

      const todayChangePerc = marketValue - todayChange !== 0
        ? Math.abs(todayChange / (marketValue - todayChange))
        : null;

      const unrealisedProfitOrLossPerc = totalCost !== 0
        ? Math.abs(unrealisedProfitOrLoss / totalCost)
        : null;

      const realisedProfitOrLossPerc = realisedTotal - realisedProfitOrLoss !== 0
        ? Math.abs(realisedProfitOrLoss / (realisedTotal - realisedProfitOrLoss))
        : null;

      return {
        name,
        accountId,
        todayChange,
        todayChangePerc,
        unrealisedProfitOrLoss,
        unrealisedProfitOrLossPerc,
        realisedProfitOrLoss,
        realisedProfitOrLossPerc,
        marketValue,
        totalCost,
        currency: this.getTargetCurrency(),
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
}
