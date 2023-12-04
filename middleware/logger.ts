var winston = require('winston');
require('winston-daily-rotate-file');

let fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: `./logs/${'%DATE%'}/dailylog.log`,
  datePattern: 'DD-MM-YYYY',
  maxSize: '20m',
});

let basicLogger = winston.createLogger({
  transports: [fileRotateTransport],
});

export { basicLogger };
