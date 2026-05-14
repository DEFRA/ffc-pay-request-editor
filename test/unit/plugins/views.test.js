const path = require('path')

jest.mock('nunjucks')
jest.mock('../../../app/config', () => ({
  isDev: true,
  serviceName: 'Test Service'
}))

const nunjucks = require('nunjucks')
const { version } = require('../../../package.json')

const pluginModule = require('../../../app/plugins/views')

describe('Vision plugin configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic structure', () => {
    test('should export plugin and options', () => {
      expect(pluginModule).toHaveProperty('plugin')
      expect(pluginModule).toHaveProperty('options')
    })

    test('should configure context correctly', () => {
      const { context } = pluginModule.options

      expect(context).toMatchObject({
        appVersion: version,
        assetPath: '/static',
        govukAssetPath: '/assets',
        serviceName: 'Test Service',
        pageTitle: 'Test Service'
      })
    })

    test('should set isCached based on config.isDev', () => {
      expect(pluginModule.options.isCached).toBe(false)
    })
  })

  describe('compile', () => {
    test('should compile and render a template with nunjucks', () => {
      const renderMock = jest.fn().mockReturnValue('rendered output')
      const compileMock = jest.fn().mockReturnValue({
        render: renderMock
      })

      nunjucks.compile.mockImplementation(compileMock)

      const src = 'Hello {{ name }}'
      const options = {
        environment: {}
      }

      const compiledFn =
        pluginModule.options.engines.njk.compile(src, options)

      const result = compiledFn({ name: 'Obi Wan' })

      expect(nunjucks.compile).toHaveBeenCalledWith(src, options.environment)
      expect(renderMock).toHaveBeenCalledWith({ name: 'Obi Wan' })
      expect(result).toBe('rendered output')
    })
  })

  describe('prepare', () => {
    test('should configure nunjucks environment and call next', () => {
      const addGlobalMock = jest.fn()

      nunjucks.configure.mockReturnValue({
        addGlobal: addGlobalMock
      })

      const options = {
        relativeTo: '/base',
        path: ['views'],
        compileOptions: {},
        context: {}
      }

      const next = jest.fn()

      pluginModule.options.engines.njk.prepare(options, next)

      expect(nunjucks.configure).toHaveBeenCalled()

      const [paths, configObj] = nunjucks.configure.mock.calls[0]

      expect(paths).toEqual([
        path.join('/base', 'views'),
        'app/views',
        'node_modules/govuk-frontend/dist'
      ])

      expect(configObj).toMatchObject({
        autoescape: true,
        watch: true
      })

      expect(addGlobalMock).toHaveBeenCalledWith(
        'getAssetPath',
        expect.any(Function)
      )

      expect(next).toHaveBeenCalled()
    })

    test('should correctly resolve getAssetPath variations', () => {
      let getAssetPath

      nunjucks.configure.mockReturnValue({
        addGlobal: (name, fn) => {
          if (name === 'getAssetPath') {
            getAssetPath = fn
          }
        }
      })

      const options = {
        relativeTo: '/base',
        path: ['views'],
        compileOptions: {},
        context: {
          assetPath: '/custom-base/'
        }
      }

      pluginModule.options.engines.njk.prepare(options, jest.fn())

      expect(getAssetPath('image.png')).toBe('/custom-base/image.png')
      expect(getAssetPath('/image.png')).toBe('/custom-base/image.png')
      expect(getAssetPath('')).toBe('/custom-base')
      expect(getAssetPath(undefined)).toBe('/custom-base')
    })

    test('should fallback to default assetPath when none provided', () => {
      let getAssetPath

      nunjucks.configure.mockReturnValue({
        addGlobal: (name, fn) => {
          if (name === 'getAssetPath') {
            getAssetPath = fn
          }
        }
      })

      const options = {
        relativeTo: '/base',
        path: ['views'],
        compileOptions: {},
        context: {}
      }

      pluginModule.options.engines.njk.prepare(options, jest.fn())

      expect(getAssetPath('file.js')).toBe('/static/file.js')
    })
  })
})
