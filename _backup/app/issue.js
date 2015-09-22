var Issue = function (config) {
    this.config = config;
};

Issue.create = function (config) {
    return new Module(config);
};

Issue.prototype = {

};

module.exports = Issue;