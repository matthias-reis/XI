var Page = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
};

Page.prototype = {
    render: function () {
        return '<h1>Hallo Renderer</h1>';
    },
    getData: function () {
        return {
            title: 'page title',
            description: 'page description',
            keywords: ['key', 'word'],
            css: 'css.css',
            debug: 'debug',
            content: this.render()
        }
    }
};

module.exports = Page;