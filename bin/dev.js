#!/usr/bin/env node

var app = require('../app/express'),
    log = require('../app/log');

app.set('port', process.env.PORT || 5000);
app.set('debug', true);

var server = app.listen(app.get('port'), function () {
    console.log('==================================');
    console.log('Mag.IC server running on port ' + app.get('port'));
    console.log('Environment: DEV');
    console.log('==================================');
    log.info('Ready to go!');
});

process.on('uncaughtException', function (err) {
    console.log('!!!Uncaught Error!!!');
    console.error(err.stack);
    process.exit(1);
});