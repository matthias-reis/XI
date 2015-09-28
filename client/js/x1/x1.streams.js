(function(global) {

  function schedule(time, iterations, generator) {
    generator = generator || function(i) {
      return i;
    };

    var s = new Stream(),
        i = 0,
        fn = function() {
          var data = {
            data: generator(i),
            meta: {
              name: 'scheduled-chunk',
              iteration: i,
              maxIterations: iterations
            }
          };
          s.push(data);
          if (!iterations || i < iterations - 1) {
            i++;
            window.setTimeout(fn, time);
          } else {
            s.triggerEnd();
          }
        };
    window.setTimeout(fn, 0);

    return s;
  }

  function fromArray(arr) {
    var s = new Stream();
    window.setTimeout(function() {
      arr.forEach(function(item) {
        var data = {
          data: item,
          meta: {
            name: 'array-chunk'
          }
        };
        s.push(data);
      });
      s.triggerEnd();
    }, 0);

    return s;
  }

  function fromRange(start, end, stepSize) {
    stepSize = stepSize || 1;
    var s = new Stream();
    window.setTimeout(function() {
      for (var i = start; i <= end; i += stepSize) {
        var data = {
          data: i,
          meta: {
            name: 'range-chunk',
            start: start,
            end: end,
            stepSize: stepSize
          }
        };
        s.push(data);
      }
      s.triggerEnd();
    }, 0);

    return s;
  }

  function fromPromise(promise) {
    var s = new Stream();
    promise.then(function(data) {
      data = {
        data: data,
        meta: {
          name: 'single-promise-chunk'
        }
      };
      s.push(data);
      s.triggerEnd();
    });

    return s;
  }

  var Observer = function(stream) {
    this.stream = stream;
    this._ev = [];
    this._er = [];
    this._dn = [];
    this._fi = [];
    this._one = [];
  };

  /*** OBSERVER ***/
  Observer.prototype = {
    triggerError: function(err) {
      while (one = this._one.shift()) {// jshint ignore:line
        one.fail(data);
      }
      this._er.forEach(function(cb) {
        cb(err);
      });
      this._fi.forEach(function(cb) {
        cb();
      });
    },
    triggerEnd: function() {
      while (one = this._one.shift()) {// jshint ignore:line
        one.fail(new Error('End of stream'));
      }
      this._dn.forEach(function(cb) {
        cb();
      });
      this._fi.forEach(function(cb) {
        cb();
      });
    },
    trigger: function(data) {
      var p;
      while (one = this._one.shift()) {// jshint ignore:line
        one.ok(data);
      }
      this._ev.forEach(function(cb) {
        cb(data);
      });
    },
    finally: function(cb) {
      this._fi.push(cb);
      return this;
    },
    onError: function(cb) {
      this._er.push(cb);
      return this;
    },
    done: function(cb) {
      this._dn.push(cb);
      return this;
    },
    on: function(cb) {
      this._ev.push(cb);
      return this;
    },
    one: function() {
      var self = this;
      return new Promise(function(ok, fail) {
        self._one.push({ok: ok, fail: fail});
      });
    }
  };

  /*** STREAM ***/
  var Stream = function() {
    this._o = [];
    this._isStoring = true;
    this._s = [];
  };

  Stream.prototype = {

    /*** STREAM CONDUCTORS ***/
    getObserver: function() {
      var observer = new Observer(this);
      this._o.push(observer);
      return observer;
    },
    triggerError: function(err) {
      this._o.forEach(function(obs) {
        obs.triggerError(err);
      });
    },
    triggerEnd: function() {
      this._o.forEach(function(obs) {
        obs.triggerEnd();
      });
    },
    push: function(item) {
      if (this._isStoring) {
        this._s.push(item);
      }
      this._o.forEach(function(obs) {
        obs.do(item);
      });
    },
    transient: function() {
      this._isStoring = false;
      this._s = [];
    },
    toArray: function() {
      return this._s;
    },
    getAll: function() {
      return fromArray(this._s);
    },

    pipe: function(other, fn) {
      var observer = this.getObserver();

      observer.on(function(data) {
        fn(function(resultingData) {
          var chunk = {
            data: resultingData,
            parent: data,
            meta: {
              name: 'piped-chunk'
            }
          };
          other.push(chunk);
        }, data);
      }).onError(other.throw.bind(other)).done(other.end.bind(other));
    },


    /*** STREAM MANIPULATORS ***/
    appendPromise: function(fn) {
      var s = new Stream();
      this.observe().on(function(data) {
        var promise = fn(data);
        if (!promise || !promise.then) {
          s.triggerError(new Error('appendPromise: the callback function must return a promise'));
          return;
        }
        promise.then(function(resultingData) {
          s.push({
            data: resultingData,
            parent: data,
            meta: {
              name: 'appended-promise-chunk'
            }
          });
        });
      });
      return s;
    },

    append: function(fn) {
      var s = new Stream();
      this.getObserver()
          .on(function(data) {
            fn(data).getObserver()
                .on(function(childData) {
                  s.push({
                    data: childData,
                    parent: data,
                    meta: {
                      name: 'appended-stream-chunk'
                    }
                  });
                })
                .onError(s.triggerError.bind(s));
          })
          .onError(s.triggerError.bind(s));
      return s;
    },

    merge: function(otherStream) {
      var s = new Stream();
      var openStreams = 2;

      var connect = function(stream, streamName) {
        stream
            .getObserver()
            .on(function(chunk) {
              s.push({
                parent: chunk,
                meta: {
                  name: 'merged-' + streamName + '-chunk'
                }
              });
            })
            .onError(s.triggerError.bind(s))
            .done(function() {
              openStreams--;
              if (openStreams === 0) {
                s.triggerEnd();
              }
            });
      };

      connect(this, 'primary');
      connect(otherStream, 'secondary');

      return s;
    },

    partition: function(fn) {
      var a = new Stream();
      var b = new Stream();

      this.getObserver().on(function(chunk) {
        var data = {
          parent: chunk,
          meta: {
            name: 'partitioned-chunk'
          }
        };
        if (fn(chunk)) {
          a.push(data);
        } else {
          b.push(data);
        }
      }).onError(function(err) {
        a.triggerError(err);
        b.triggerError(err);
      }).done(function() {
        a.triggerEnd();
        b.triggerEnd();
      });
    },

    filter: function(fn) {
      var s = new Stream();
      this.pipe(s, function(resolve, data) {
        if (fn(data)) {
          resolve(data);
        }
      });
      return s;
    },

    map: function(otherStream) {
      // TODO
      var s = new Stream();
      this.pipe(s, function(resolve, data) {
        resolve(fn(data));
      });
      return s;
    },

    throttle: function(ms) {
      var s = new Stream(),
          last;

      this.pipe(s, function(resolve, data) {
        var now = +(new Date());
        if (!last || now - last > ms) {
          resolve(data);
          last = now;
        }
      });
      return s;
    },

    skip: function(times) {
      var s = new Stream(),
          count = 0;

      this.pipe(s, function(resolve, data) {
        if (count % times === 0) {
          resolve(data);
        }
        count++;
      });
      return s;
    }
  };

  x1('x1.streams', {
    Observer: Observer,
    Stream: Stream,

    schedule: schedule,
    fromArray: fromArray,
    fromRange: fromRange,
    fromPromise: fromPromise
  });
})(this);