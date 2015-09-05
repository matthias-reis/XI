var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var log = require('./log');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig');
var routes = require('../conf/routes');

var app = express();

app.routing = express.Router();

// view engine setup
app.engine('twig', swig.renderFile);
app.set('views', path.join(__dirname, '../view/core/tpl'));
app.set('view engine', 'twig');
app.set('version', require('../package.json').version);

// uncomment after placing your favicon in /public
app.use(favicon('view/core/img/favicon.ico'));
app.use(logger(':date   [:status :method :url]   [t: :response-time]   [from: :remote-addr]   [Referrer: :referrer]   [UA: :user-agent]'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', routes);

app.notFound = function (next) {
    var err = new Error('Nichts gefunden');
    err.status = 404;
    next(err);
};

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    app.notFound(next);
});

app.use(function (err, req, res) {
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
