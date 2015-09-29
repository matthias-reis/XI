describe('Stream Modification', function() {
  it('creates a stream from a time interval schedule', function(done) {
    x1(['x1.streams'], {
      ready: function(streams) {
        var stream = streams.fromSchedule(10, 3); // 3 x every 10ms
        var counter = 0;

        stream.getObserver().on(function (res) {
          expect(res.data).to.equal(counter);
          counter++;
        }).finally(function () {
          expect(counter).to.equal(3);
          done();
        });
      }
    })
  });

});