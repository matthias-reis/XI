var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var log = require('./log');
var accessLog = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('view engine', 'jade');
app.set('views', './srv/core/views');
app.set('version', require('../../package.json').version);

// uncomment after placing your favicon in /public
app.use(favicon('client/assets/favicon.ico'));
app.use(accessLog(':date   [:status :method :url]   [t: :response-time]   [from: :remote-addr]   [Referrer: :referrer]   [UA: :user-agent]'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/client', express.static('client',{fallthrough: false}));

app.get('/', function (req, res) {
    "use strict";
    res.render('index');
});

//app.use('/', app.magazine.routing());

// catch 404 and forward to error handler
app.use(function (req, res) {
    res.status(404).render('404');
});

app.use(function (err, req, res) {
    console.log('ERROR RAISED');
    log.error('FEHLER', err.status);
    if (err.status != 404) {
        console.log('inside');
        log.error(err.status + ' Internal Server Error: ' + err.message);
        log.error(err.stack);
    }
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err.stack
    });
});

module.exports = app;
