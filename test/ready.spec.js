describe('Execution on Ready', function() {
  it('should execute code on ready', function(done) {
    x1({
      ready: function () {
        expect(true).to.be.true;
        done();
      }
    });
  });

  it('should execute code on ready even after page is ready', function(done) {
    x1({
      ready: function () {
        x1({ready: function () {
          expect(this._id).to.equal(10);
          done();
        }});
      }
    });
  });
});