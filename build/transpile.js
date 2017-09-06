// support for new key words
require('babel-polyfill')

var babel = require('babel-core')
var path = require('path')
var fs = require('fs')

function bail (error) {
  // explicitly fail - this will bubble to our ci
  throw (error)
}

function transpile () {
  // https://babeljs.io/docs/usage/api/#options
  var options = {
    comments: false,
    compact: true,
    minified: true
  }

  var src = path.resolve(__dirname, '../src/core.js')
  var target = path.resolve(__dirname, '../dist/lonamic.js')

  console.info('starting transpilation')
  babel.transformFile(src, options, function (err, result) {
    if (err) { return bail(err) }
    fs.writeFile(target, result.code, function (err) {
      if (err) { return bail(err) }
      console.info('finished transpilation')
    })
  })
}

transpile()
