XI.paths({
  XI: '/base/src',
  node1: ['/base/test/fixtures/node11.js', '/base/test/fixtures/node12.js'],
  node21: ['/base/test/fixtures/node21.js'],
  node22: ['/base/test/fixtures/node22.js'],
  node31: ['/base/test/fixtures/node31.js'],
  node32: ['/base/test/fixtures/node32.js'],
  noNode: ['/base/test/fixtures/noNode.js']
});

// For old Phantom 1.9.8 --> no supported browser needs that!
Function.prototype.bind = Function.prototype.bind || function(thisp) {
  var fn = this;
  return function() {
    return fn.apply(thisp, arguments);
  };
};
