(function (global) {
    "use strict";
    var version = '0.0.1',
        handlers = {},
        currentId = 0,
        nodes = {},
        loadableNodes = {},
        loadingNodes = {},
        modulePaths = {},
        pageReadyCallbacks = [],
        events = {},
        document = global.document;

    function noop() {}

    function isArray(obj) {
        return obj && obj.length;
    }


    function is(type, item) {
        return toString.call(item).indexOf('[object ' + type) == 0;
    }

    function loadNode(nodeName, cb) {

    }

    function load(url, deferred, cb) {
        var el = document.createElement('script');
        function process (ev) {
            ev = ev || global.event;
            if (ev.type == 'load' || readyStates[el.readyState]) {
                delete activeScripts[def.id];
                el.onload = el.onreadystatechange = el.onerror = '';
                cb();
            }
        }

        function fail (err) {
            cb({success: false, message: 'error: requesting url [' + url + ']'});
        }

        el.onload = el.onreadystatechange = process;
        el.onerror = fail;
        el.type = 'text/javascript';
        el.charset = 'utf-8';
        el.defer = deferred;
        el.src = url;

        activeScripts[def.id] = el;

        var firstScriptEl = document.getElementsByTagName('script')[0];
        firstScriptEl.parentNode.insertBefore(el, firstScriptEl);
    }

    function trigger(eventName) {
        if(!events[eventName]) {
            events[eventName] = {triggered: true}
        } else {
            events[eventName].callbacks.forEach(function (callback) {
                callback();
            });
        }
    }

    function on(eventName, callback) {
        if(!events[eventName]) {
            events[eventName] = {triggered: false, callbacks: []}
        }
        events[eventName].callbacks.push(callback);
    }

    global.x1 = function (name, dependencies, tasks) {
        var nodeReadyCallbacks = [],
            node = {
                _version: version,
                _id: currentId++,
                _messages: []
            };

        if(!is('String', name)) {
            node.name = 'anonymous';
            dependencies = arguments[0];
            tasks = arguments[1];
        } else {
            node.name = name;
            nodes[name] = node;
        }

        node.on = function(event, cb) {
            on('node' + node._id, cb);
        };

        if(!isArray(dependencies)) {
            tasks = dependencies;
            dependencies = [];
        }

        on('documentRunnable', function () {

        });

        for(var key in tasks) {
            if(tasks.hasOwnProperty(key)) {
                if(handlers[key]) {
                    handlers[key].call(node, tasks[key]);
                } else {
                    node._messages.push('config: handler not found for [' + key + ']');
                }
            }
        }

        return node;
    };

    x1.register = function (key, callback) {
        if(typeof callback == 'function') {
            handlers[key] = callback;
        } else {
            this.node._messages.push('handler: registered without callback function [' + key + ']')
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

    window.addEventListener("load", function () {
        window.setTimeout(function () {
            trigger('document-runnable');
        }, 0);
    });

    if(!window.Promise) {
        load(modulePaths.x1 + '/x1.promise.js', false, function(result) {
            if(result.success) {
                trigger('runnable');
            } else {
              throw Error('could not load promise polyfill ... stoppping execution')
            }
        });
    } else {
        trigger('runnable');
    }

})(this);