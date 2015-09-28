describe('Dependency Management', function() {
  it('should add a previously defined dependency', function(done) {
    x1('localDependency');
    var node = x1(['localDependency'],{
      ready: function(localDependency) {
        expect(localDependency.name).to.equal('localDependency');
        done();
      }
    });
  });

  it('should load a dependency', function(done) {
    var node = x1(['node1'],{
      ready: function(node1) {
        expect(node1.name).to.equal('node1');
        done();
      }
    });
  });

  it('should load more dependencies', function(done) {
    var node = x1(['node2', 'node3'],{
      ready: function(node2, node3) {
        expect(node2.name).to.equal('node2');
        expect(node3.name).to.equal('node3');
        done();
      }
    });
  });
});