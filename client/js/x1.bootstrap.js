(function (global) {
    "use strict";
    var version = '0.0.1',
        handlers = {},
        isArray = function (obj) {
            return obj && obj.length;
        };

    global.x1 = function (dependencies, tasks) {
        var node = {
            _version: version,
            _statements: []
        };
        if(!isArray(dependencies)) {
            tasks = dependencies;
            dependencies = null;
        }
        node.dependencies = dependencies;

        for(var key in tasks) {
            if(tasks.hasOwnProperty(key)) {
                if(handlers[key]) {
                    handlers[key].call(node, tasks[key]);
                } else {
                    node.statements.push('config: handler not found for [' + key + ']');
                }
            }
        }

        return node;
    };

    x1.register = function (key, callback) {
        if(typeof callback == 'function') {
            handlers[key] = callback;
        } else {
            this.node.statements.push('handler: registered without callback function [' + key + ']')
        }
    };

    x1.register('exec', function (cb) {
        cb.call(this);
    });

    x1.register('ready', function (cb) {
        var node = this;
        window.addEventListener("load", function () {
            cb.call(node);
        });
    });

})(this);