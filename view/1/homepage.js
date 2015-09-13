var Page = require('../../app/page'),
    counter = 0;

module.exports = Page.create({
    id: '01.home',
    mountpoint: '/',
    title: 'Ausgabe 1',
    description: 'bla',
    keywords: ['key', 'word'],
    css: ['/core/css/styleguide','/1/css/main'],
    js: ['/core/js/core','/1/js/main'],
    node: require('./react/Page.Home'),
    request: function(req, res, next) {
        counter++;
        this.data.counter = counter;
    }
});
