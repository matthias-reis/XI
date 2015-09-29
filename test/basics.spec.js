describe('XI base featureset', function () {
  it('should load chai, the expectation framework correctly', function () {
    expect(true).to.be.true;
  });

  it('should initialize XI', function () {
    var node = XI();
    expect(node._version).to.be.defined;
    expect(node._id).to.equal(0);
  });

  it('has Promises', function(done) {
    XI().on('ready', function() {
      expect(window.Promise).to.be.defined;
      done();
    })
  });

  it('should accept options as first argument and run code immediately', function (done) {
    XI({
      run: function () {
        expect(this._id).to.equal(2);
        done();
      }
    });
  });

  it('should transform options into node properties if no handler is found', function(done) {
    XI({
      run: function() {
        expect(this.value).to.equal(42);
        done();
      },
      value: 42
    }).on('error', function(err) {
      console.log(err);
      done();
    });;
  });

  it('should trigger errors', function (done) {
    XI({
      run: function () {
        throw new Error('artificial error');
      }
    }).on('error', function (err) {
      expect(this._id).to.be.defined;
      done();
    });
  });

  it('should accept options as the second argument and accept a name', function (done) {
    var name = 'testnode2';
    XI(name, {
      run: function () {
        expect(this._id).to.equal(5);
        expect(this.name).to.equal(name);
        done();
      }
    });
  });

  it('should accept options as the second argument and accept dependencies', function (done) {
    XI([], {
      run: function () {
        expect(this._id).to.equal(6);
        expect(this.name).to.equal('anonymous6');
        done();
      }
    });
  });

  it('should accept options as the third argument', function (done) {
    var name = 'testnode4';
    XI(name, [], {
      run: function () {
        expect(this._id).to.equal(7);
        expect(this.name).to.equal(name);
        done();
      }
    });
  });
});