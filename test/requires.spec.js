describe('Dependency Management', function() {
  it('should add a previously defined dependency', function(done) {
    x1('localDependency');
    var node = x1(['localDependency'],{
      ready: function(dependencies) {
        expect(dependencies.localDependency).to.be.defined;
        done();
      }
    });
  });

  it('should load a dependency', function(done) {
    var node = x1(['node1'],{
      ready: function(dependencies) {
        expect(dependencies.node1).to.be.defined;
        done();
      }
    });
  });
});