type StyleOptions = 'currency' | 'decimal' | 'percent';

type NumberFormatOptions = {
  /**
   * Minimum number of decimal places?
   */
  decimals?: number;
  /**
   * Which currency to use? Default: `"AUD"` (only applies when `style="currency"`)
   */
  currency?: string;
  /**
   * Render up/down triangle before value?
   */
  showTriangle?: boolean;
};

/**
 * Number formatter.
 *
 * @param style Which format to use
 * @param value The number to be formatted
 * @param options Additional options to use. Default: `currency="AUD"` (only applies when `style="currency"`)
 * @returns Formatted number as a string
 */
export const numberFormat = (style: StyleOptions, value: number | null, options?: NumberFormatOptions) => {
  if (value === null) return '-';
  const { decimals, currency = 'AUD', showTriangle } = options || {};

  let result = '';

  if (showTriangle && value !== null && value !== 0) {
    result += (value > 0) ? '▴' : '▾';
  }

  result += Intl.NumberFormat('en-AU', {
    style,
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return result;
};
