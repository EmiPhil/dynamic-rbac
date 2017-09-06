var nodeResolve = require('rollup-plugin-node-resolve')
var babel = require('rollup-plugin-babel')
var uglify = require('rollup-plugin-uglify')

var config = {
  output: {
    format: 'umd'
  },
  name: 'lonamic',
  plugins: [
    nodeResolve({
      jsnext: true
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    uglify({
      compress: {
        pure_getters: true,
        warnings: false
      }
    })
  ]
}

export default config
