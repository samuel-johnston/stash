import { app } from 'electron';
import dayjs from 'dayjs';
import path from 'path';
import fs from 'fs';

// Ensure log directory exists
const dirPath = app.getPath('logs');
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Number of digits to use for number in file name
// eg. '2025-03-19_001' uses 3 digits.
const numDigits = 3;

const today = dayjs().format('YYYY-MM-DD');
const todayPattern = new RegExp(`^${today}_(\\d{${numDigits}}).log$`);

// Find the highest number already used in the logs
let maxNumber = 0;
for (const filename of fs.readdirSync(dirPath)) {
  const match = filename.match(todayPattern);
  if (match != null) {
    const num = parseInt(match[1]) || 0;
    if (num > maxNumber) {
      maxNumber = num;
    }
  }
}

// Setup the log file
const logFilename = `${today}_${String(maxNumber + 1).padStart(numDigits, '0')}.log`;
const logPath = path.join(dirPath, logFilename);
fs.writeFileSync(logPath, '');
const stream = fs.createWriteStream(logPath, { flags: 'a' });

/**
 * Appends the given message to the current log file.
 * Each message is appended on a single line.
 *
 * @param message The message to be appended
 */
export const writeLog = (message: string) => {
  const time = dayjs().format('HH:mm:ss');
  stream.write(`[${time}] ${message} \n`);
};

// Initial log message
writeLog(`Log started on ${dayjs().format('dddd, MMMM D, YYYY h:mm A')}`);
