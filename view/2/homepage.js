var Page = require('../../app/page'),
    counter = 0;

module.exports = Page.create({
    id: '02.home',
    mountpoint: '/',
    title: 'Ausgabe 2',
    description: 'bla',
    keywords: ['key', 'word'],
    css: ['/core/css/styleguide','/2/css/main'],
    js: ['/core/js/core','/2/js/main']
});
