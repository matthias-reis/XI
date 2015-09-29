describe('XI Stream Modification', function() {
  it('can append a promise to a stream', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {

        var stream = streams.fromArray([2, 20, 10]);
        var counter = 0;
        var newStream = stream.appendPromise(function(chunk) {
          return new Promise(function(ok) {
            window.setTimeout(function() {
              ok(chunk.data * 3);
            }, chunk.data);
          });
        });

        newStream.getObserver().on(function(newChunk) {
          counter++;
          if (counter === 1) {
            expect(newChunk.data).to.equal(6);
          }
          if (counter === 2) {
            expect(newChunk.data).to.equal(30);
          }
          if (counter === 3) {
            expect(newChunk.data).to.equal(60);
            done();
          }
        })
      }
    });
  });

  it('can append a stream to a stream', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var s = streams.fromRange(1, 3);
        var s2 = s.append(function(chunk) {
          return streams.fromArray([chunk.data * 10, chunk.data * 100]);
        });
        s.getObserver().done(function() {
          window.setTimeout(function() {
            var chunks = s2.toArray().map(function(chunk) {
              return chunk.data
            });
            expect(chunks).to.deep.equal([10, 100, 20, 200, 30, 300]);
            done();
          }, 0);
        });
      }
    });
  });

  it('can merge two streams into one', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var s1 = streams.fromSchedule(20, 3, function(i) {
          return '5@' + i;
        });
        var s2 = streams.fromSchedule(12, 4, function(i) {
          return '3@' + i;
        });

        var s = s1.merge(s2);
        s.getObserver().on(function(chunk) {
        }).done(function() {
          window.setTimeout(function() {
            var chunks = s.toArray().map(function(chunk) {
              return chunk.data
            });
            expect(chunks).to.deep.equal(['5@0', '3@0', '3@1', '5@1', '3@2', '3@3', '5@2']);
            done();
          }, 0);
        });
      }
    });
  });

  it('split a stream into two', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var s = streams.fromRange(1, 10);
        var partitionedStreams = s.partition(function(chunk) {
          return chunk.data % 2 === 0;
        });

        s.getObserver().done(function() {
          expect(partitionedStreams[0].toArray().map(function(chunk) {
            return chunk.data
          })).to.deep.equal([2, 4, 6, 8, 10]);
          expect(partitionedStreams[1].toArray().map(function(chunk) {
            return chunk.data
          })).to.deep.equal([1, 3, 5, 7, 9]);
          done();
        });
      }
    });
  });

  it('can filter a stream', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var s = streams.fromRange(1, 10);
        var f = s.filter(function(chunk) {
          return chunk.data % 2 === 0;
        });

        s.getObserver().done(function() {
          expect(s.toArray().map(function(chunk) {
            return chunk.data
          })).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          expect(f.toArray().map(function(chunk) {
            return chunk.data
          })).to.deep.equal([2, 4, 6, 8, 10]);
          done();
        });
      }
    });
  });

  it('can map a function to a stream', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var s = streams.fromRange(1, 5);
        var s2 = s.map(function(chunk) {
          return chunk.data * 10;
        });

        s.getObserver().done(function() {
          expect(s2.toArray().map(function(chunk) {
            return chunk.data
          })).to.deep.equal([10, 20, 30, 40, 50]);
          done();
        });
      }
    });
  });

  it('can throttle a stream', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var s = streams.fromSchedule(5, 10);
        var s2 = s.throttle(25);

        s.getObserver().done(function() {
          expect(s2.toArray().map(function(chunk) {
            return chunk.data
          })).to.deep.equal([0, 3, 6, 9]);
          done();
        });
      }
    });
  });


  it('can skip events of a stream', function(done) {
    XI(['XI.streams'], {
      ready: function(streams) {
        var s = streams.fromRange(1, 10);
        var s2 = s.skip(3);

        s.getObserver().done(function() {
          expect(s2.toArray().map(function(chunk) {
            return chunk.data
          })).to.deep.equal([1, 4, 7, 10]);
          done();
        });
      }
    });
  });

});