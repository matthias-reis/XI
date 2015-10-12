describe('XI dependency management', function() {
  it('should add a previously defined dependency', function(done) {
    XI('localDependency');
    XI(['localDependency'], {
      ready: function(localDependency) {
        expect(localDependency.name).to.equal('localDependency');
        done();
      }
    });
  });

  it('should load a dependency asynchronously', function(done) {
    XI(['node1'], {
      ready: function(node1) {
        expect(node1.name).to.equal('node1');
        expect(node1.valueFromGlobal).to.equal(42);
        done();
      }
    }).on('error', function(err) {
      expect(true).to.be.false;
      done()
    });
  });

  it('raises an error event if a dependency cannot be found', function(done) {
    XI(['undefinedNode']).on('error', function(err) {
      expect(err).to.be.defined;
      done();
    })
  });

  it('loads more than one dependency', function(done) {
    XI(['node21', 'node22'], {
      ready: function(node21, node22) {
        expect(node21.name).to.equal('node21');
        expect(node22.name).to.equal('node22');
        done();
      }
    });
  });

  it('loads cascading dependency', function(done) {
    XI(['node31'], {
      ready: function(node31) {
        expect(node31.name).to.equal('node31');
        expect(node31._dependencies.node32.name).to.equal('node32');
        done();
      }
    });
  });

  it('loads js files that are no XI nodes', function(done) {
    XI(['noNode'], {
      ready: function() {
        expect(window.fortytwo).to.equal(42);
        done();
      }
    });
  });
});