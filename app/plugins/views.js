const path = require('path')
const nunjucks = require('nunjucks')
const config = require('../config')
const { version } = require('../../package.json')

module.exports = {
  plugin: require('@hapi/vision'),
  options: {
    engines: {
      njk: {
        compile: (src, options) => {
          const template = nunjucks.compile(src, options.environment)

          return (context) => {
            return template.render(context)
          }
        },
        prepare: (options, next) => {
          options.compileOptions.environment = nunjucks.configure([
            path.join(options.relativeTo || process.cwd(), ...options.path),
            'app/views',
            'node_modules/govuk-frontend/dist'
          ], {
            autoescape: true,
            watch: config.isDev
          })

          options.compileOptions.environment.addGlobal('getAssetPath', function (assetPath) {
            const base = (options && options.context && options.context.assetPath) || '/static'
            const normalizedBase = String(base).replace(/\/+$/, '')
            const normalizedAsset = String(assetPath || '').replace(/^\/+/, '')
            return normalizedBase + (normalizedAsset ? '/' + normalizedAsset : '')
          })

          options.compileOptions.environment.addGlobal('getGovukAssetPath', function (assetPath) {
            const base = (options && options.context && options.context.govukAssetPath) || '/assets'
            const normalizedBase = String(base).replace(/\/+$/, '')
            const normalizedAsset = String(assetPath || '').replace(/^\/+/, '')
            return normalizedBase + (normalizedAsset ? '/' + normalizedAsset : '')
          })

          return next()
        }
      }
    },
    path: ['../views'],
    relativeTo: __dirname,
    isCached: !config.isDev,
    context: {
      appVersion: version,
      assetPath: '/static',
      govukAssetPath: '/assets',
      serviceName: config.serviceName,
      pageTitle: `${config.serviceName}`
    }
  }
}
