var mocha = require('mocha');

global.expect = require('chai').expect;

mocha = new mocha({
    ui : 'bdd',
    reporter : 'spec'
});

mocha.checkLeaks();

mocha.addFile(__dirname + '/tests.js');
mocha.run(function () {
    console.log('done');
});
