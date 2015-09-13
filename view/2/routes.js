var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    require('./homepage').render(req, res, next);
});
router.get('/interesting', function (req, res) {
    res.end('<h1>2 > interesting</h1>');
});

module.exports = router;