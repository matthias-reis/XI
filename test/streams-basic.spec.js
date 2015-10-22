describe('XI Streams basic creation', function() {

  it('loads streams', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        expect(streams.Stream).to.be.defined;
        done();
      }
    })
  });

  it('creates a stream from scratch', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = new streams.Stream();
        expect(stream.push).to.be.defined;
        done();
      }
    })
  });

  it('lets the stream cope with events', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = new streams.Stream();
        var observer = stream.getObserver();
        observer.on(function(chunk) {
          expect(chunk.value).to.equal(42);
          done();
        });

        stream.push({value: 42});
      }
    })
  });

  it('lets the stream have an end', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = new streams.Stream();
        var observer = stream.getObserver();
        observer.on(function(data) {
          expect(data.value).to.equal(42);
        }).done(function() {
          expect(true).to.be.true;
        }).finally(function() {
          expect(true).to.be.true;
          done();
        });

        stream.triggerEnd();
      }
    })
  });

  it('lets the stream cope with single events', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = new streams.Stream();
        var observer = stream.getObserver();
        var counter1 = 0;
        var counter2 = 0;

        observer.one().then(function(data) {
          counter1++;
          expect(data.value).to.equal(42);
        });

        observer.on(function() {
          counter2++;
        }).finally(function() {
          window.setTimeout(function () {
            expect(counter1).to.equal(1);
            expect(counter2).to.equal(2);
            done();
          });
        });

        stream.push({value: 42});
        stream.push({value: 43});
        stream.triggerEnd();
      }
    })
  });

  it('lets the stream publish errors', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = new streams.Stream();
        var observer = stream.getObserver();
        observer.onError(function(err) {
          expect(err.message).to.equal('my message');
        }).finally(function() {
          expect(true).to.be.true;
          done();
        });

        stream.triggerError(new Error('my message'));
      }
    })
  });

  it('lets the stream have more than one observer', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = new streams.Stream();
        var observer1 = stream.getObserver();
        var observer2 = stream.getObserver();

        observer1.on(function(data) {
          expect(data.value).to.equal(42);
        });
        observer2.on(function(data) {
          expect(data.value).to.equal(42);
        }).finally(function() {
          done();
        });

        stream.push({value: 42});
        stream.triggerEnd();
      }
    })
  });
  it('lets the stream return previous events', function() {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = new streams.Stream();
        stream.push({data: 'data'});
        stream.push({data: 'data'});
        stream.push({data: 'data'});
        stream.push({data: 'data'});
        expect(stream.toArray()).have.length.of(4);
      }
    })
  });
  it('can make the stream stop recording events', function() {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = new streams.Stream();
        stream.push({data: 'data'});
        stream.push({data: 'data'});
        stream.transient();
        stream.push({data: 'data'});
        stream.push({data: 'data'});
        expect(stream.toArray()).have.length.of(0);
      }
    })
  });
  it('can return all previous events as a new stream', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var stream = new streams.Stream();
        stream.push({val: 1});
        stream.push({val: 2});
        stream.push({val: 3});
        var stream2 = stream.getAll();
        var observer = stream2.getObserver();
        var counter = 0;
        observer.on(function(chunk) {
          counter += chunk.data.val;
        }).finally(function() {
          expect(counter).to.equal(6);
          done();
        });
      }
    })
  });

});