describe('Streams', function() {
  it('loads streams', function(done) {
    x1(['x1.streams'], {
      ready: function(streams) {
        expect(streams.Stream).to.be.defined;
        done();
      }
    }).on('error', function (err) {
      console.log(err)
    });
  });
});