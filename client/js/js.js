"use strict";

console.log('simple log in script');

var node1 = x1({
    exec: function () {
        console.log('immediately executed function with context', this._version);
    },
    ready: function () {
        console.log('on ready executed function with context', this._version);
    }
});

var node2 = x1(['module1', 'module2'], {
    exec: function () {
        console.log('executed after dependencies are loaded function with context', this._version);
    }
});

console.log('nodes after declaration', node1, node2);