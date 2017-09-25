require('babel-register')
require('babel-polyfill')

// Core Tests
require('./core.test')
require('./inheritance.test')
require('./core.hydrate.test')
require('./can.test')
require('./core.can.test')
require('./filter.test')
require('./core.filter.test')

// Practical Tests
require('./examples/index.test')
