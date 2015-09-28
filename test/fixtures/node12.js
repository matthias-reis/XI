x1('node1', {
  ready: function () {
    this.valueFromGlobal = window.globalDependency;
  }
});