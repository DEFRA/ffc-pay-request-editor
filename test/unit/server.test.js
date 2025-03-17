const createServer = require('../../app/server')

jest.mock('@hapi/hapi')
jest.mock('@hapi/catbox-redis', () => jest.fn())
jest.mock('@hapi/catbox-memory', () => jest.fn())
jest.mock('../../app/config', () => ({
  authConfig: { enabled: false },
  useRedis: false,
  processingActive: true,
  isDev: false,
  port: 3000,
  cacheName: 'test-cache',
  catboxOptions: {}
}))

jest.mock('@hapi/inert')
jest.mock('../../app/plugins/auth')
jest.mock('../../app/plugins/views')
jest.mock('../../app/plugins/router')
jest.mock('../../app/plugins/error-pages')
jest.mock('../../app/plugins/crumb')
jest.mock('../../app/plugins/session-cache')
jest.mock('../../app/plugins/view-context')
jest.mock('../../app/plugins/logging')
jest.mock('../../app/routes/healthy')
jest.mock('../../app/routes/healthz')
jest.mock('blipp')

jest.mock('@hapi/hapi', () => {
  return {
    server: jest.fn(() => ({
      register: jest.fn(),
      route: jest.fn()
    }))
  }
})

describe('createServer', () => {
  test('should use @hapi/catbox-memory when useRedis is false', async () => {
    jest.resetModules()

    jest.doMock('../../app/config', () => ({
      ...jest.requireActual('../../app/config'),
      useRedis: false
    }))

    const catboxMemory = jest.fn()
    jest.doMock('@hapi/catbox-memory', () => catboxMemory)

    jest.isolateModules(() => {
      require('../../app/server')
    })

    expect(require('@hapi/catbox-memory')).toBe(catboxMemory)
  })

  test('should use @hapi/catbox-redis when useRedis is true', async () => {
    jest.resetModules()

    jest.doMock('../../app/config', () => ({
      ...jest.requireActual('../../app/config'),
      useRedis: true
    }))

    const catboxRedis = jest.fn()
    jest.doMock('@hapi/catbox-redis', () => catboxRedis)

    jest.isolateModules(() => {
      require('../../app/server')
    })

    expect(require('@hapi/catbox-redis')).toBe(catboxRedis)
  })

  test('should register plugins when processingActive is true', async () => {
    const server = await createServer()
    expect(server.register).toHaveBeenCalledWith(require('../../app/plugins/auth'))
    expect(server.register).toHaveBeenCalledWith(require('@hapi/inert'))
    expect(server.register).toHaveBeenCalledWith(require('../../app/plugins/views'))
    expect(server.register).toHaveBeenCalledWith(require('../../app/plugins/router'))
    expect(server.register).toHaveBeenCalledWith(require('../../app/plugins/error-pages'))
    expect(server.register).toHaveBeenCalledWith(require('../../app/plugins/crumb'))
    expect(server.register).toHaveBeenCalledWith(require('../../app/plugins/session-cache'))
    expect(server.register).toHaveBeenCalledWith(require('../../app/plugins/view-context'))
    expect(server.register).toHaveBeenCalledWith(require('../../app/plugins/logging'))
  })

  test('should register health check routes when processingActive is false', async () => {
    jest.resetModules()
    jest.doMock('../../app/config', () => ({
      useRedis: false,
      processingActive: false,
      isDev: false,
      port: 3000,
      cacheName: 'test-cache',
      catboxOptions: {}
    }))
    const createServerWithoutProcessing = require('../../app/server')
    const server = await createServerWithoutProcessing()
    expect(server.register).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'router'
      })
    )
  })

  test('should register blipp plugin in development mode', async () => {
    jest.resetModules()
    jest.doMock('../../app/config', () => ({
      useRedis: false,
      processingActive: true,
      isDev: true,
      port: 3000,
      cacheName: 'test-cache',
      catboxOptions: {}
    }))
    const createServerDev = require('../../app/server')
    const server = await createServerDev()
    expect(server.register).toHaveBeenCalledWith(require('blipp'))
  })
})
