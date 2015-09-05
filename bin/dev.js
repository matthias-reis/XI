#!/usr/bin/env node

var app = require('../app/express'),
    log = require('../app/log');

app.set('port', process.env.PORT || 5000);

var server = app.listen(app.get('port'), function () {
    log.info('==================================');
    log.info('Mag.IC server running on port ' + app.get('port'));
    log.info('Environment: DEV');
    log.info('==================================');
});

process.on('uncaughtException', function (err) {
    console.log('!!!Uncaught Error!!!');
    console.error(err.stack);
    process.exit(1);
});