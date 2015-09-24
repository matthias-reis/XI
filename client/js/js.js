"use strict";

console.log('===> simple log output after evaluation');

x1.paths({
    x1: '/x1',
    node1: ['/client/js/node11.js', '/client/js/node12.js'],
    node2: ['/client/js/Module2.js']
});

var nodes = [
    //x1({
    //    exec: function () {
    //        console.log('===> immediately executed function with context', this._version);
    //    },
    //    ready: function () {
    //        console.log('===> on ready executed function with context', this._version);
    //    }
    //}),
    //x1(['node1', 'node2'], {
    //    exec: function () {
    //        console.log('===> executed before dependencies are loaded function with context', this._version);
    //    },
    //    ready: function (node1, node2) {
    //        console.log('===> dependent node 1', node1);
    //        console.log('===> dependent node 2', node2);
    //        console.log('===> executed after dependencies are loaded function with context', this._version);
    //    }
    //}),
    x1('UppercaseNotation', ['node1', 'node2'], {
        ready: function (node1, node2) {
            console.log('===> running a named node called', this.name);
            console.log('===> dependent node 1', node1);
            console.log('===> dependent node 2', node2);
        }
    })
];

console.log('===> nodes after declaration', nodes);