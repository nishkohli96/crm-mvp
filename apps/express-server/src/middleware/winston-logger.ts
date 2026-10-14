/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { createLogger, addColors, format, transports } from 'winston';
import { ENV_VARS } from '@/constants';

const { combine, timestamp, printf } = format;

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    success: 4
  },
  colors: {
    error: 'bold red blackBG',
    warn: 'italic yellow',
    info: 'blue',
    http: 'magenta',
    success: 'green'
  }
};

const logFormat = printf(
  ({ level, message, timestamp }) => `[ ${level} ]:: ${timestamp} - ${message}`
);

const winstonLogger = createLogger({
  levels: customLevels.levels,
  format: combine(
    timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    format.splat(),
    logFormat
  ),
  //   defaultMeta: { service: 'log-service' },
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new transports.File({ filename: 'logs/info-warning.log' })
  ]
});

addColors(customLevels.colors);

if (ENV_VARS.env !== 'production') {
  winstonLogger.add(
    new transports.Console({ format: format.colorize({ all: true }) })
  );
}

export { winstonLogger };
