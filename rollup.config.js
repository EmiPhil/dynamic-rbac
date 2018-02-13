import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import pkg from './package.json'

const babelConfig = {
  exclude: 'node_modules/**',
  runtimeHelpers: true,
  externalHelpers: true
}

const config = [
  // browser-friendly UMD build
  {
    input: 'src/core.js',
    output: {
      name: pkg.name,
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel(babelConfig),
      uglify()
    ]
  },
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // the `targets` option which can specify `file` and `format`)
  {
    input: 'src/core.js',
    external: id => {
      if (/lodash/.test(id)) return true
      if (/buffer/.test(id)) return true
      if (/babel-runtime/.test(id)) return true
      return false
    },
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      babel(babelConfig),
      uglify()
    ]
  }
]

export default config
