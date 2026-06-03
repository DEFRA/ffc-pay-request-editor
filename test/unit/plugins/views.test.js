const path = require('node:path')

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
      const env = {
        addGlobal: jest.fn(),
        addFilter: jest.fn()
      }
      nunjucks.configure.mockReturnValue(env)

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

      expect(env.addGlobal).toHaveBeenCalledWith(
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
        },
        addFilter: jest.fn()
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
        },
        addFilter: jest.fn()
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

  describe('sentences filter', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const getSentencesFilterFromPrepare = (context = {}) => {
      let filterFn
      nunjucks.configure.mockReturnValue({
        addFilter: (name, fn) => { if (name === 'sentences') filterFn = fn },
        addGlobal: jest.fn()
      })

      pluginModule.options.engines.njk.prepare({
        relativeTo: '/base',
        path: ['views'],
        compileOptions: {},
        context
      }, jest.fn())

      return filterFn
    }

    test('returns empty array for null or undefined', () => {
      const filterFn = getSentencesFilterFromPrepare()
      expect(filterFn(null)).toEqual([])
      expect(filterFn(undefined)).toEqual([])
    })

    test('accepts numeric 0 and converts to string sentence', () => {
      const filterFn = getSentencesFilterFromPrepare()
      expect(filterFn(0)).toEqual(['0'])
    })

    test('returns input unchanged when already an array', () => {
      const filterFn = getSentencesFilterFromPrepare()
      const arr = ['One.', 'Two?']
      expect(filterFn(arr)).toBe(arr)
    })

    test('splits text into sentences preserving punctuation and trimming', () => {
      const filterFn = getSentencesFilterFromPrepare()
      const text = ' Hello world. This is a test! Is it working?  '
      expect(filterFn(text)).toEqual([
        'Hello world.',
        'This is a test!',
        'Is it working?'
      ])
    })

    test('handles text with no terminal punctuation', () => {
      const filterFn = getSentencesFilterFromPrepare()
      expect(filterFn('Single sentence without punctuation')).toEqual(['Single sentence without punctuation'])
    })

    test('filters out empty matches', () => {
      const filterFn = getSentencesFilterFromPrepare()
      expect(filterFn('...')).toEqual([])
    })
  })
})
