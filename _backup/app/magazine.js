var TreeNode = require ('./treenode');
'use strict';

class Magazine extends TreeNode {
    constructor(config) {
        this.config = config;
    }

    static init(config) {
        if (!this.mag) {
            this.mag = new Magazine(config);
        }
        return this.mag;
    }
    static get () {
        if (!this.mag) {
            throw new Error('Magazine: Please init first');
        }
        return this.mag;
    }

    routing () {
        //router consists of magazine pages and child issue routers
        return function (req, res, next) {
            res.end(JSON.stringify(this.config));
        }.bind(this);
    }
}


module.exports = Magazine;