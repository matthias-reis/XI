var winston = require('winston');

//
// Logging levels
//
var config = {
    levels: {
        silly: 0,
        verbose: 1,
        info: 2,
        data: 3,
        warn: 4,
        debug: 5,
        error: 6
    },
    colors: {
        silly: 'magenta',
        verbose: 'cyan',
        info: 'green',
        data: 'grey',
        warn: 'yellow',
        debug: 'blue',
        error: 'red'
    },
    exitOnError: false
};

module.exports = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: true
        })
    ],
    levels: config.levels,
    colors: config.colors
});