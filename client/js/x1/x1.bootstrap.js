(function(global) {
  "use strict";
  var version = '0.0.1',
      handlers = {},
      currentId = 0,
      nodes = {},
      loadingNodes = {},
      modulePaths = {},
      events = {},
      document = global.document,
      timeout = global.setTimeout;

  function noop() {
  }

  function is(type, item) {
    return toString.call(item).indexOf('[object ' + type) === 0;
  }

  function loadNode(nodeName) {
    if (nodes[nodeName]) {
      return new Promise(function(resolve) {
        nodes[nodeName].on('ready', function() {
          resolve(nodes[nodeName]);
        }).on('error', function(err) {
          reject(new Error('error initializing node [' + nodeName + ']: ' + err));
        });
      });
    } else if (loadingNodes[nodeName]) {
      return loadingNodes[nodeName];
    } else {
      loadingNodes[nodeName] = new Promise(function(resolve, reject) {
        if (!modulePaths[nodeName]) {
          reject(new Error('node load paths not defined [' + nodeName + ']'));
          return;
        }
        var counter = modulePaths[nodeName].length;
        modulePaths[nodeName].forEach(function(path) {
          load(path, function(res) {
            if (!res.success) {
              reject(new Error('could not load [' + path + '] of node [' + nodeName + ']'));
              return;
            }
            counter--;
            if (!counter) {
              if (!nodes[nodeName]) {
                reject(new Error('node not defined [' + nodeName + ']'));
              } else {
                nodes[nodeName].on('ready', function() {
                  resolve(nodes[nodeName]);
                }).on('error', function(err) {
                  reject(new Error('error initializing node [' + nodeName + ']: ' + err));
                });
              }
            }
          });
        });
      });

      return loadingNodes[nodeName];
    }
  }

  function load(url, cb) {
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
      events[eventName] = {triggered: true};
    } else {
      events[eventName].triggered = true;
      events[eventName].payload = payload;
      events[eventName].callbacks && events[eventName].callbacks.forEach(function(callback) {
        callback(payload);
      });// jshint ignore:line
    }
  }

  function on(eventName, callback) {
    if (!events[eventName]) {
      events[eventName] = {triggered: false, callbacks: [callback]};
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
      return node;
    };

    node.trigger = function(event, payload) {
      trigger(node.name + '@' + event, payload);
      return node;
    };

    on('document-runnable', function() {
      var counter = dependencies.length;
      if (dependencies.length) {
        dependencies.forEach(function(dependency) {
          loadNode(dependency).then(function(otherNode) {
            node._dependencies[dependency] = otherNode;
            counter--;
            if (!counter) {
              node.trigger('ready');
            }
          }).catch(function(err) {
            node._messages.push(err);
            node.trigger('error', err);
          });
        });
      } else {
        node.trigger('ready');
      }
    });

    for (var key in tasks) {
      if (tasks.hasOwnProperty(key)) {
        if (handlers[key]) {
          handlers[key].call(node, tasks[key]);
        }
        node[key] = tasks[key];
      }
    }

    return node;
  };

  x1.register = function(key, callback) {
    if (typeof callback == 'function') {
      handlers[key] = callback;
    } else {
      this.node._messages.push('handler: registered without callback function [' + key + ']');
    }
  };

  x1.paths = function(paths) {
    modulePaths = paths;

    if (!global.Promise) {
      load(modulePaths.x1 + '/x1.promise.js', false, function(result) {
        if (result.success) {
          trigger('runnable');
        } else {
          throw Error('could not load promise polyfill ... stoppping execution');
        }
      });
    } else {
      trigger('runnable');
    }
  };


  global.addEventListener("load", function() {
    timeout(function() {
      trigger('document-runnable');
    }, 0);
  });

  // BASIC REGISTERS

  x1.register('run', function(cb) {
    var node = this;
    timeout(function () {
      try {
        cb.call(node);
      } catch (err) {
        node.trigger('error', err);
      }
    });
  });

  x1.register('ready', function(cb) {
    var node = this, vals = [];
    node.on('ready', function() {
      try {
        for (var key in node._dependencies) {
          if (node._dependencies.hasOwnProperty(key)) {
            vals.push(node._dependencies[key]);
          }
        }
        cb.apply(node, vals);
      } catch (err) {
        console.log(err);
        node.trigger('error', err);
      }
    });
  });

})(this);