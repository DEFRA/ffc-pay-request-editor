const ERROR_VIEWS = require('../../../app/constants/error-views')
const {
  NOT_AUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  SERVICE_TIMEOUT
} = require('../../../app/constants/status-codes')

const plugin = require('../../../app/plugins/error-pages').plugin

describe('error-pages plugin onPreResponse extension', () => {
  let serverMock
  let hMock
  let requestMock

  beforeEach(() => {
    serverMock = {
      ext: jest.fn((event, handler) => {
        if (event === 'onPreResponse') {
          serverMock.onPreResponseHandler = handler
        }
      })
    }

    hMock = {
      continue: Symbol('continue'),
      view: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis()
    }

    requestMock = {
      log: jest.fn()
    }
  })

  beforeEach(() => {
    plugin.register(serverMock, {})
    expect(serverMock.ext).toHaveBeenCalledWith('onPreResponse', expect.any(Function))
  })

  const createBoomResponse = (statusCode, message, data) => ({
    isBoom: true,
    output: { statusCode },
    message,
    data
  })

  test('should continue if response is not a Boom error', () => {
    requestMock.response = { isBoom: false }

    const result = serverMock.onPreResponseHandler(requestMock, hMock)
    expect(result).toBe(hMock.continue)
  })

  describe('when response is a Boom error', () => {
    test.each([
      [NOT_AUTHORIZED, ERROR_VIEWS.NOT_AUTHORIZED],
      [FORBIDDEN, ERROR_VIEWS.NOT_AUTHORIZED]
    ])('should render NOT_AUTHORIZED view for status code %i', (statusCode, expectedView) => {
      const message = 'Auth error message'
      requestMock.response = createBoomResponse(statusCode, message)

      const result = serverMock.onPreResponseHandler(requestMock, hMock)

      expect(hMock.view).toHaveBeenCalledWith(expectedView)
      expect(hMock.code).toHaveBeenCalledWith(statusCode)
      expect(result).toBe(hMock.view())
    })

    test('should render NOT_FOUND view for 404', () => {
      const statusCode = NOT_FOUND
      requestMock.response = createBoomResponse(statusCode, 'Not found message')

      const result = serverMock.onPreResponseHandler(requestMock, hMock)

      expect(hMock.view).toHaveBeenCalledWith(ERROR_VIEWS.NOT_FOUND)
      expect(hMock.code).toHaveBeenCalledWith(statusCode)
      expect(result).toBe(hMock.view())
    })

    test('should render INTERNAL_SERVER_ERROR view with message', () => {
      const statusCode = INTERNAL_SERVER_ERROR
      const message = 'Internal error occurred'
      requestMock.response = createBoomResponse(statusCode, message)

      const result = serverMock.onPreResponseHandler(requestMock, hMock)

      expect(hMock.view).toHaveBeenCalledWith(ERROR_VIEWS.INTERNAL_SERVER_ERROR, { message })
      expect(hMock.code).toHaveBeenCalledWith(statusCode)
      expect(result).toBe(hMock.view())
    })

    test('should render SERVICE_TIMEOUT view with message', () => {
      const statusCode = SERVICE_TIMEOUT
      const message = 'Service timeout error'
      requestMock.response = createBoomResponse(statusCode, message)

      const result = serverMock.onPreResponseHandler(requestMock, hMock)

      expect(hMock.view).toHaveBeenCalledWith(ERROR_VIEWS.SERVICE_TIMEOUT, { message })
      expect(hMock.code).toHaveBeenCalledWith(statusCode)
      expect(result).toBe(hMock.view())
    })

    test('should log error and continue for other status codes', () => {
      const statusCode = 418
      const message = 'Some other error'
      const data = { some: 'data' }
      requestMock.response = createBoomResponse(statusCode, message, data)

      const result = serverMock.onPreResponseHandler(requestMock, hMock)

      expect(requestMock.log).toHaveBeenCalledWith('error', {
        statusCode,
        data,
        message
      })
      expect(result).toBe(hMock.continue)
    })

    test('should use default message if response.message is falsy', () => {
      const statusCode = INTERNAL_SERVER_ERROR
      requestMock.response = createBoomResponse(statusCode, '')

      const result = serverMock.onPreResponseHandler(requestMock, hMock)

      expect(hMock.view).toHaveBeenCalledWith(
        ERROR_VIEWS.INTERNAL_SERVER_ERROR,
        { message: 'An unexpected error occurred' }
      )
      expect(hMock.code).toHaveBeenCalledWith(statusCode)
      expect(result).toBe(hMock.view())
    })
  })
})
