describe('Execution on Ready', function() {
  it('should execute code on ready', function(done) {
    x1({
      ready: function () {
        expect(true).to.be.true;
        done();
      }
    });
  });

  it('should execute code on readyeven after page is ready', function(done) {
    x1({
      ready: function () {
        x1({ready: function () {
          expect(true).to.be.true;
          expect(this._id).to.equal(8);
          done();
        }});
      }
    });
  });
});