var express = require('express');
var router = express.Router();
var Page = require('.././page');

/* GET home page. */
router.get('/', function startpage(req, res, next) {
    Page.create(require('./homepage.config')).render(req, res, next);
});
router.get('/interesting', function interestingpage(req, res) {
    res.end('<h1>1 > interesting</h1>');
});

module.exports = router;