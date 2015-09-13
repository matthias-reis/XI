var express = require('express');
var router = express.Router();
var mags = require('../conf/mags');

/* GET home page. */
router.get('/', function (req, res) { res.end('<h1>Homepage</h1>'); });
router.get('/agb', function (req, res) { res.end('<h1>AGBs</h1>'); });

var slug = 1;
mags.forEach(function () {
    var magrouter = require('../view/' + slug + '/routes');

    router.use('/' + slug, magrouter);
    slug++;
});

module.exports = router;