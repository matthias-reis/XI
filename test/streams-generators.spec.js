describe('XI Stream Generators', function() {
  it('creates a stream from a time interval schedule', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = streams.fromSchedule(10, 3); // 3 x every 10ms
        var counter = 0;

        stream.getObserver().on(function (res) {
          expect(res).to.equal(counter);
          counter++;
        }).finally(function () {
          expect(counter).to.equal(3);
          done();
        });
      }
    })
  });

  it('can manipulate the time schedule data', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = streams.fromSchedule(10, 3, function(i){
          return i + 1;
        });
        var counter = 0;

        stream.getObserver().on(function(res) {
          counter++;
          expect(res).to.equal(counter);
        }).finally(function() {
          expect(counter).to.equal(3);
          done();
        });
      }
    })
  });

  it('creates a stream from an array', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = streams.fromArray([10, 20, 30]);
        var sum = 0;
        stream.getObserver().on(function(res) {
          sum += res;
        }).finally(function() {
          expect(sum).to.equal(60);
          done();
        });
      }
    })
  });

  it('creates a stream out of a sequenced range', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = streams.fromRange(10, 14);
        var sum = 0;
        stream.getObserver().on(function(res) {
          sum += res;
        }).finally(function() {
          expect(sum).to.equal(10 + 11 + 12 + 13 + 14);
          done();
        });
      }
    })
  });

  it('creates a stream out of a sequenced range including step length', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = streams.fromRange(10, 30, 5);
        var sum = 0;
        stream.getObserver().on(function(res) {
          sum += res;
        }).finally(function() {
          expect(sum).to.equal(10 + 15 + 20 + 25 + 30);
          done();
        });
      }
    })
  });

  it('creates a stream from a promise', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = streams.fromPromise(new Promise(function (ok, fail) {
          window.setTimeout(ok, 10);
        }));
        var called = false;
        stream.getObserver().on(function(res, meta) {
          called = true;
          expect(meta.name).to.equal('single-promise-chunk');
        }).finally(function() {
          expect(called).to.be.true;
          done();
        });
      }
    })
  });

  it('handles errors on promise based streams', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = streams.fromPromise(new Promise(function(ok, fail) {
          window.setTimeout(fail, 10);
        }));
        var called = false;
        var hasErrors = false;
        stream.getObserver().on(function() {
          called = true;
        }).onError(function() {
          hasErrors = true;
        }).finally(function() {
          expect(called).to.be.false;
          expect(hasErrors).to.be.true;
          done();
        });
      }
    })
  });
});