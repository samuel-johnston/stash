import { getData, setData } from '@storage';
import yahooFinance from 'yahoo-finance2';
import { SecurityOption } from '@types';
import { Quote } from 'yahoo-finance2/dist/esm/src/modules/quote';
import { writeLog } from '@logs';

/**
 * Returns securities that match the given search query from Yahoo Finance.
 * Excludes results that are already added into the application.
 *
 * @param query Anything you'd put in the search box at the top of `https://finance.yahoo.com/`
 */
export const searchSecurities = async (query: string) => {
  const securities = await getData('securities');
  const searchResults = await yahooFinance.search(query, {
    lang: 'en-AU',
    region: 'AU',
  });

  const returnArray: SecurityOption[] = [];

  for (const quote of searchResults.quotes) {
    // Ensure fields are present and remove any quotes already added
    if ('symbol' in quote && 'longname' in quote && !securities.has(quote.symbol)) {
      returnArray.push({
        symbol: quote.symbol,
        name: (quote.longname as string).toUpperCase(),
        type: quote.typeDisp,
        exchange: quote.exchange,
      });
    }
  }

  return returnArray;
};

/**
 * Adds a new security into the application.
 *
 * @param data Data for the new security
 * @throws Throws error if symbol already exists, yahooFinance.quote() failed, currency was missing, or exchange mismatch
 */
export const addSecurity = async (data: SecurityOption) => {
  const { symbol, name, exchange, type } = data;
  const securities = await getData('securities');

  if (securities.has(symbol)) {
    writeLog(`[addSecurity]: Could not continue as '${symbol}' already exists`);
    throw new Error('Symbol already exists');
  }

  // We still need to fetch the currency for the security
  // (since it doesn't come with yahooFinance.search() results)
  let quote: Quote;
  try {
    quote = await yahooFinance.quote(symbol, { fields: ['currency', 'exchange'] });
  } catch (error) {
    writeLog(`[addSecurity]: Could not continue as yahooFinance.quote() failed: ${error.message}`);
    throw new Error('Could not fetch quote data');
  }

  if (!('currency' in quote)) {
    writeLog(`[addSecurity]: Could not continue as 'currency' field was missing: ${quote}`);
    throw new Error('Currency field was missing from quote data');
  }

  if (quote.exchange !== exchange) {
    writeLog(`[addSecurity]: Could not continue as 'exchange' field did not match: ${quote.exchange} !== ${exchange}`);
    throw new Error('Exchange field mismatch from quote data');
  }

  securities.set(symbol, {
    symbol,
    name,
    currency: quote.currency!,
    exchange,
    type,
    countries: [],
    financialStatus: [],
    miningStatus: [],
    resources: [],
    products: [],
    recommendations: [],
    monitor: [],
    reasonsToBuy: '',
    reasonsNotToBuy: '',
    positives: '',
    negatives: '',
    notes: [],
    alerts: [],
    holdings: [],
    buyHistory: [],
    sellHistory: [],
  });

  await setData('securities', securities);
};
