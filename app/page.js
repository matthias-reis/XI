var React = require('react/addons');

var Page = function () {};

Page.prototype = {
    render: function () {
        if(!this.cache) {
            if (this.node) {
                this.cache = React.renderToString(this.node({}));
            } else {
                this.cache =  '<h1>Hallo Renderer</h1>';
            }
        }

        return this.cache;
    },
    getData: function (req, res, next) {
        return {
            title: this.meta.title + '&rdquo;' || '',
            description: this.meta.description || '',
            keywords: this.meta.keywords || [],
            version: req.app.get('version'),
            css: this.meta.css || req.app.get('baseCss'),
            js: this.meta.css || req.app.get('baseJs'),
            debug: req.app.get('debug'),
            content: this.render()
        }
    },
    setNode: function (node) {
        this.node = node;
        return this;
    },
    meta: function (meta) {
        this.meta = meta;
        return this;
    }
};

module.exports = Page;