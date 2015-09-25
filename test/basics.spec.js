describe('X1 base featureset', function () {
  it('should load chai, the expectation framework correctly', function () {
    expect(true).to.be.true;
  });

  it('should initialize x1', function () {
    var node = x1();
    expect(node._version).to.be.defined;
    expect(node._id).to.equal(0);
  });

  it('has Promises', function(done) {
    x1().on('ready', function() {
      expect(window.Promise).to.be.defined;
      done();
    })
  });

  it('should accept options as first argument and run code immediately', function (done) {
    var node = x1({
      run: function () {
        expect(this._id).to.equal(2);
        done();
      }
    });
  });

  it('should accept options as the second argument and accept a name', function (done) {
    var name = 'testnode2';
    var node = x1(name, {
      run: function () {
        expect(this._id).to.equal(3);
        expect(this.name).to.equal(name);
        done();
      }
    });
  });

  it('should accept options as the second argument and accept dependencies', function (done) {
    var node = x1([], {
      run: function () {
        expect(this._id).to.equal(4);
        expect(this.name).to.equal('anonymous4');
        done();
      }
    });
  });

  it('should accept options as the third argument', function (done) {
    var name = 'testnode4';
    var node = x1(name, [], {
      run: function () {
        expect(this._id).to.equal(5);
        expect(this.name).to.equal(name);
        done();
      }
    });
  });

});