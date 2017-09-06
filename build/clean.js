var rimraf = require('rimraf')
var fs = require('fs')
var path = require('path')

function bail (error) {
  // explicitly fail - this will bubble to our ci
  throw (error)
}

function clean () {
  var target = path.resolve(__dirname, '../dist')

  console.log('cleaning...')
  rimraf(target, function (err) {
    if (err) { return bail(err) }
    fs.mkdir(target, function (err) {
      if (err) { return bail(err) }
      console.log('...cleaned')
    })
  })
}

clean()
