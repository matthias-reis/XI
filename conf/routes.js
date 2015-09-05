var express = require('express');
var router = express.Router();
var Page = require('../app/page');

/* GET home page. */
router.get('/', function (req, res, next) {
    var page = new Page(req, res, next);
    res.render('index', {
        page:page.getData(),
        version: '0.0.1'
    });
});

module.exports = router;