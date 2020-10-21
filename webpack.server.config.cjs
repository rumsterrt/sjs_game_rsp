const getConfig = require('startupjs/bundler.cjs').webpackServerConfig
const path = require('path')

const ALIAS = {
  serverHelpers: path.join(__dirname, '/serverHelpers')
}

module.exports = getConfig(undefined, {
  forceCompileModules: [],
  alias: ALIAS
})
