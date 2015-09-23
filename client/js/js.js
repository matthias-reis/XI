"use strict";

console.log('===> simple log output after evaluation');

x1.paths = {
    x1: '/x1',
    Module1: '/client/js/Module1.js',
    Module2: '/client/js/Module2.js'
};

var nodes = [
    x1({
        exec: function () {
            console.log('===> immediately executed function with context', this._version);
        },
        ready: function () {
            console.log('===> on ready executed function with context', this._version);
        }
    }),
    x1(['Module1', 'Module2'], {
        exec: function () {
            console.log('===> executed before dependencies are loaded function with context', this._version);
        },
        ready: function () {
            console.log('===> executed after dependencies are loaded function with context', this._version);
        }
    }),
    x1('UppercaseNotation', ['Module1', 'Module2'], {
        ready: function (module1, module2) {
            console.log('===> running a named node called', this.name);
        }
    })
];

console.log('===> nodes after declaration', nodes);