(function(global) {

  function fromSchedule(time, iterations, generator) {
    generator = generator || function(i) {
      return i;
    };

    var s = new Stream(),
        i = 0,
        fn = function() {
          s.push(generator(i), {
            name: 'scheduled-chunk',
            time: time,
            iteration: i,
            maxIterations: iterations
          });
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
        s.push(item, {
          name: 'array-chunk'
        });
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
        s.push(i, {
          name: 'range-chunk',
          start: start,
          end: end,
          stepSize: stepSize
        });
      }
      s.triggerEnd();
    }, 0);

    return s;
  }

  function fromPromise(promise) {
    var s = new Stream();
    promise.then(function(data) {
      s.push(data, {
        name: 'single-promise-chunk'
      });
      s.triggerEnd();
    }, function(err) {
      s.triggerError(err);
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
    trigger: function(data, meta) {
      var p;
      while (one = this._one.shift()) {// jshint ignore:line
        one.ok(data, meta);
      }
      this._ev.forEach(function(cb) {
        cb(data, meta);
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
    push: function(item, meta) {
      if (this._isStoring) {
        this._s.push({
          data: item,
          meta: meta
        });
      }
      this._o.forEach(function(obs) {
        obs.trigger(item, meta);
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

      observer.on(function(data, meta) {
        fn(function(resultingData) {
          other.push(resultingData, {
            parent: data,
            parentMeta: meta,
            name: 'piped-chunk'
          });
        }, data, meta);
      }).onError(other.triggerError.bind(other)).done(other.triggerEnd.bind(other));
    },


    /*** STREAM MANIPULATORS ***/
    appendPromise: function(fn) {
      var s = new Stream();
      this.getObserver().on(function(data, meta) {
        var promise = fn(data);
        if (!promise || !promise.then) {
          s.triggerError(new Error('appendPromise: the callback function must return a promise'));
          return;
        }
        promise.then(function(resultingData) {
          s.push(resultingData, {
            parent: data,
            parentMeta: meta,
            name: 'appended-promise-chunk'
          });
        });
      });
      return s;
    },

    append: function(fn) {
      var s = new Stream();
      var onError =
          this.getObserver()
              .on(function(data, meta) {
                fn(data, meta).getObserver()
                    .on(function(childData, childMeta) {
                      s.push(childData, {
                        parent: data,
                        parentMeta: meta,
                        childMeta: childMeta,
                        name: 'appended-stream-chunk'
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
            .on(function(chunk, meta) {
              s.push(chunk, {
                parentMeta: meta,
                name: 'merged-' + streamName + '-chunk'
              });
            })
            .onError(s.triggerError.call(s))
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

      this.getObserver().on(function(chunk, meta) {
        var childMeta = {
          parentMeta: meta,
          name: 'partitioned-chunk'
        };
        if (fn(chunk)) {
          a.push(chunk, childMeta);
        } else {
          b.push(chunk, childMeta);
        }
      }).onError(function(err) {
        a.triggerError(err);
        b.triggerError(err);
      }).done(function() {
        a.triggerEnd();
        b.triggerEnd();
      });

      return [a, b];
    },

    filter: function(fn) {
      var s = new Stream();
      this.pipe(s, function(resolve, chunk, meta) {
        if (fn(chunk, meta)) {
          resolve(chunk);
        }
      });
      return s;
    },

    map: function(fn) {
      var s = new Stream();
      this.pipe(s, function(resolve, chunk, meta) {
        resolve(fn(chunk, meta));
      });
      return s;
    },

    throttle: function(ms) {
      var s = new Stream(),
          last;

      this.pipe(s, function(resolve, chunk) {
        var now = +(new Date());
        if (!last || now - last > ms) {
          resolve(chunk);
          last = now;
        }
      });
      return s;
    },

    skip: function(times) {
      var s = new Stream(),
          count = 0;

      this.pipe(s, function(resolve, chunk) {
        if (count % times === 0) {
          resolve(chunk);
        }
        count++;
      });
      return s;
    }
  };

  XI('XI.streams', {
    Observer: Observer,
    Stream: Stream,

    fromSchedule: fromSchedule,
    fromArray: fromArray,
    fromRange: fromRange,
    fromPromise: fromPromise
  });
})(this);