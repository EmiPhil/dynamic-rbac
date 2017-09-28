import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

const babelConfig = {
  exclude: 'node_modules/**',
  runtimeHelpers: true
}

const config = [
  // browser-friendly UMD build
  {
    input: 'src/core.js',
    output: {
      file: pkg.browser,
      format: 'umd'
    },
    name: pkg.name,
    plugins: [
      resolve(),
      commonjs(),
      babel(babelConfig)
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
      if (/babel-runtime/.test(id)) return true
      return false
    },
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      babel(babelConfig)
    ]
  }
]

export default config
