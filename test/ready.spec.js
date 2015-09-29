describe('XI execution on "ready"', function() {
  it('should execute code on ready', function(done) {
    XI({
      ready: function () {
        expect(true).to.be.true;
        done();
      }
    });
  });

  it('should execute code on ready even after page is ready', function(done) {
    XI({
      ready: function () {
        XI({ready: function () {
          expect(this._id).to.equal(10);
          done();
        }});
      }
    });
  });
});