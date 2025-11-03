import winston from 'winston';

import { config } from './config';

const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
  defaultMeta: { service: 'feed-replication-service' },
  exitOnError: false,
});

export default logger;
