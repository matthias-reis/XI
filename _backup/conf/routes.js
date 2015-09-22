var express = require('express');
var router = express.Router();
var mags = require('mags');

/* home page */
router.get('/', function (req, res) { res.end('<h1>Homepage</h1>'); });

/* additional pages */
router.get('/agb', function (req, res) { res.end('<h1>AGBs</h1>'); });

/* static core routes */
router.get('/0/js', express.static('../view/core/js'));
router.get('/0/css', express.static('../view/core/css'));
router.get('/0/client', express.static('../view/core/client'));

/* magazine issues */
var slug = 1;
mags.forEach(function () {
    var magrouter = require('../view/' + slug + '/routes');

    router.use('/' + slug, magrouter);

    router.get('/' + slug + '/js', express.static('../view/' + slug + '/js'));
    router.get('/' + slug + '/css', express.static('../view/' + slug + '/css'));
    router.get('/' + slug + '/client', express.static('../view/' + slug + '/client'));

    slug++;
});

module.exports = router;