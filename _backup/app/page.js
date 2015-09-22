var React = require('react');

var Page = function (config) {
    this.data = config;
    this.node = config.node;
    this.cacheable = true;
};

Page.create = function (config) {
    return new Page(config);
};

Page.prototype = {
    react: function () {
        if(!this.cacheable || !this.cache) {
            if (this.data.node) {
                this.cache = React.renderToString(React.createElement(this.node, this.data));
            } else {
                this.cache = '<h1>No Node Found</h1>';
            }
        }

        return this.cache;
    },

    render: function (req, res, next) {
        res.render('index', this.getData(req, res, next));
    },

    getData: function (req, res, next) {
        if(this.data.request) {
            this.cacheable = false;
            this.data.request.call(this, req, res, next);
        }
        this.data.content = this.react();
        return this.data;
    }
};

module.exports = Page;