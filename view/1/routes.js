var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function startpage(req, res, next) {
    require('./homepage').render(req, res, next);
});
router.get('/interesting', function interestingpage(req, res) {
    res.end('<h1>1 > interesting</h1>');
});

module.exports = router;