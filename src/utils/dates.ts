import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * Dayjs parser.
*
* @param date Date string in the format `"DD/MM/YYYY hh:mm A"`
* @returns dayjs object
*/
export const dayjsParse = (date: string) => dayjs(date, 'DD/MM/YYYY hh:mm A');

/**
 * Dayjs stringifier.
 *
 * @example
 * dayjsStringify(dayjs) -> "11/01/2025 10:30 AM"
 *
 * @param date The date to be stringified (if left blank, will use date time now)
 * @returns Formatted date as a string with format `"DD/MM/YYYY hh:mm A"`
 */
export const dayjsStringify = (value: Dayjs = dayjs()) => value.format('DD/MM/YYYY hh:mm A');
