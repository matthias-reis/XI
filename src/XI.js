(function(global) {
  "use strict";
  var version = '0.2.0',
      interceptors = {},
      currentId = 0,
      nodes = {},
      loadingNodes = {},
      modulePaths = {},
      events = {},
      document = global.document,
      timeout = global.setTimeout,
      state = {
        INITIAL: 0,
        RUNNABLE: 1,
        READY: 2
      };

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
                nodes[nodeName] = true;
                resolve();
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

  var XI = global.XI = global.Ξ = function(name, dependencies, tasks) {
    var node = {
          _version: version,
          _id: currentId++,
          _messages: [],
          _state: state.INITIAL,
          nodes: {}
        },
        appliedInterceptors = [];

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

    node.addDependency = function(dependency) {
      if(node._state === state.INITIAL) {
        dependencies.push(dependency);
      } else {
        node._messages.push('dependencies: could not add dynamic dependency [' + dependency + ']')
      }
    };

    for (var key in tasks) {
      if (tasks.hasOwnProperty(key)) {
        if (interceptors[key]) {
          interceptors[key].call(node, tasks[key]);
          appliedInterceptors.push(key);
        }
        node[key] = tasks[key];
      }
    }

    on('document-runnable', function() {
      var counter = dependencies.length;
      node.state = 'runnable';
      if (counter) {
        dependencies.forEach(function(dependency) {
          node.nodes[dependency] = {};
          loadNode(dependency).then(function(otherNode) {
            if(otherNode || otherNode !== true) {
              node.nodes[dependency] = otherNode;
            } else {
              node._messages.push('dependencies: no node found in package [' + dependency + ']')
            }
            counter--;
            if (!counter) {
              node.state = 'ready';
              node.trigger('ready');
            }
          }).catch(function(err) {
            node._messages.push(err);
            node.trigger('error', err);
          });
        });
      } else {
        node.state = 'ready';
        node.trigger('ready');
      }
    });

    return node;
  };

  XI._version = version;

  XI.register = function(key, callback) {
    if (typeof callback == 'function') {
      interceptors[key] = callback;
    } else {
      this._messages.push('handler: registered without callback function [' + key + ']');
    }
  };

  XI.paths = function(paths) {
    if(!paths.XI) {
      throw Error('path to XI folder not defined');
    }
    modulePaths = paths;
    modulePaths['XI.streams'] = [paths.XI + '/streams.XI.js'];

    if (!global.Promise) {
      load(modulePaths.XI + '/promise.XI.js', false, function(result) {
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
  XI.register('run', function(cb) {
    var node = this;
    timeout(function () {
      try {
        cb.call(node);
      } catch (err) {
        node.trigger('error', err);
      }
    });
  });

  XI.register('ready', function(cb) {
    var node = this, vals = [];
    node.on('ready', function() {
      try {
        for (var key in node.nodes) {
          if (node.nodes.hasOwnProperty(key)) {
            vals.push(node.nodes[key]);
          }
        }
        cb.apply(node, vals);
      } catch (err) {
        node.trigger('error', err);
      }
    });
  });

})(this);