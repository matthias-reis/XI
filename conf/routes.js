var express = require('express');
var router = express.Router();
var Page = require('../app/page');

/* GET home page. */
router.get('/', function (req, res, next) {
    var page = new Page();
    res.render('index', {
        page:page.getData(req, res, next),
        version: '0.0.1'
    });
});

module.exports = router;