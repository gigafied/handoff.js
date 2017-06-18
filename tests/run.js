global.expect = require('chai').expect

const path = require('path')
const Mocha = require('mocha')

const mocha = new Mocha({
  ui: 'bdd',
  reporter: 'spec'
})

mocha.checkLeaks()

mocha.addFile(path.join(__dirname, 'tests.js'))
mocha.run()
