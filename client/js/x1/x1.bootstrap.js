(function(global) {
  "use strict";
  var version = '0.0.1',
      handlers = {},
      currentId = 0,
      nodes = {},
      loadingNodes = {},
      modulePaths = {},
      events = {},
      document = global.document;

  function noop() {
  }

  function is(type, item) {
    return toString.call(item).indexOf('[object ' + type) == 0;
  }

  function loadNode(nodeName) {
    if (nodes[nodeName]) {
      return new Promise(function(resolve) {
        resolve(nodes[nodeName]);
      })
    } else if (loadingNodes[nodeName]) {
      return loadingNodes[nodeName]
    } else if (modulePaths[nodeName]) {
      loadingNodes[nodeName] = new Promise(function(resolve, reject) {
        var counter = modulePaths[nodeName].length;
        modulePaths[nodeName].forEach(function(path) {
          load(path, function(res) {
            if (!res.success) {
              reject(new Error('could not load [' + path + '] of node [' + nodeName + ']'))
            }
            counter--;
            if (!counter) {
              resolve(nodes[nodeName]);
            }
          });
        });
      });

      return loadingNodes[nodeName];
    }
  }

  function load(url, cb) {
    console.log(url);
    var el = document.createElement('script');

    function process(ev) {
      ev = ev || global.event;
      var readyStates = 'addEventListener' in global ? {} : {'loaded': 1, 'complete': 1};
      if (ev.type == 'load' || readyStates[el.readyState]) {
        el.onload = el.onreadystatechange = el.onerror = '';
        cb({success: true});
      }
    }

    function fail(err) {
      cb({success: false, message: 'error: requesting url [' + url + ']'});
    }

    el.onload = el.onreadystatechange = process;
    el.onerror = fail;
    el.type = 'text/javascript';
    el.charset = 'utf-8';
    el.async = true;
    el.src = url;

    var firstScriptEl = document.getElementsByTagName('script')[0];
    firstScriptEl.parentNode.insertBefore(el, firstScriptEl);
  }

  function trigger(eventName, payload) {
    if (!events[eventName]) {
      events[eventName] = {triggered: true}
    } else {
      events[eventName].triggered = true;
      events[eventName].payload = payload;
      events[eventName].callbacks.forEach(function(callback) {
        callback(payload);
      });
    }
  }

  function on(eventName, callback) {
    if (!events[eventName]) {
      events[eventName] = {triggered: false, callbacks: [callback]}
    } else if (events[eventName].triggered) {
      callback(events[eventName].payload);
    } else {
      events[eventName].callbacks.push(callback);
    }
  }

  global.x1 = function(name, dependencies, tasks) {
    var node = {
      _version: version,
      _id: currentId++,
      _messages: [],
      _dependencies: {}
    };

    if (!is('String', name)) {
      node.name = 'anonymous' + node._id;
      dependencies = arguments[0];
      tasks = arguments[1];
    } else {
      node.name = name;
      nodes[name] = node;
    }

    if (!is('Array', dependencies)) {
      tasks = dependencies;
      dependencies = [];
    }

    node.on = function(event, cb) {
      on(node.name + '@' + event, cb);
    };

    node.trigger = function(event, payload) {
      trigger(node.name + '@' + event, payload);
    };

    on('document-runnable', function() {
      var counter = dependencies.length;
      if (dependencies.length) {
        dependencies.forEach(function(dependency) {
          loadNode(dependency).then(function(node) {
            node.dependencies[dependency] = node;
            if (!counter) {
              node.trigger('ready');
            }
          }).catch(function(err) {
            throw err;
          })
        });
      } else {
        node.trigger('ready');
      }

    });

    for (var key in tasks) {
      if (tasks.hasOwnProperty(key)) {
        if (handlers[key]) {
          handlers[key].call(node, tasks[key]);
        } else {
          node._messages.push('config: handler not found for [' + key + ']');
        }
      }
    }

    return node;
  };

  x1.register = function(key, callback) {
    if (typeof callback == 'function') {
      handlers[key] = callback;
    } else {
      this.node._messages.push('handler: registered without callback function [' + key + ']')
    }
  };

  x1.paths = function(paths) {
    modulePaths = paths;

    if (!window.Promise) {
      load(modulePaths.x1 + '/x1.promise.js', false, function(result) {
        if (result.success) {
          trigger('runnable');
        } else {
          throw Error('could not load promise polyfill ... stoppping execution')
        }
      });
    } else {
      trigger('runnable');
    }
  };


  window.addEventListener("load", function() {
    window.setTimeout(function() {
      trigger('document-runnable');
    }, 0);
  });

  // BASIC REGISTERS

  x1.register('run', function(cb) {
    cb.call(this);
  });

  x1.register('ready', function(cb) {
    var node = this;
    node.on('ready', function() {
      cb.call(node, node.dependencies);
    });
  });

})(this);