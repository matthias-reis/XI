(function (global) {
    "use strict";
    var version = '0.0.1',
        handlers = {},
        currentId = 0,
        nodes = {},
        modulePaths = {};

    function noop() {}

    function isArray(obj) {
        return obj && obj.length;
    }

    function is(item, type) {
        return toString.call(item).indexOf('[object ' + type) == 0;
    }

    function load(moduleName) {}

    global.x1 = function (name, dependencies, tasks) {
        var node = {
            _version: version,
            _id: currentId++,
            _statements: []
        };
        if(typeof name !== 'string') {
            dependencies = name;
            tasks = arguments[1];
        } else {
            node.name = name;
            nodes[name] = node;
        }

        if(!isArray(dependencies)) {
            tasks = dependencies;
            dependencies = null;
        }

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

    x1.paths = function (paths) {
      modulePaths = paths;
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