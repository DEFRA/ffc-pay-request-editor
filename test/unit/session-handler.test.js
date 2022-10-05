const mockGet = jest.fn()
const mockSet = jest.fn()
const mockClear = jest.fn()
const MOCK_KEY = 'key'
let request
let mockObject

const sessionHandler = require('../../app/session-handler')

describe('session handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    request = {
      yar: {
        get: mockGet,
        set: mockSet,
        clear: mockClear
      }
    }
    mockObject = {
      foo: 'bar'
    }
  })

  test('get returns object', () => {
    mockGet.mockReturnValue(mockObject)
    const result = sessionHandler.get(request, MOCK_KEY)
    expect(result).toStrictEqual(mockObject)
  })

  test('get returns empty object if no match', () => {
    mockGet.mockReturnValue(null)
    const result = sessionHandler.get(request, MOCK_KEY)
    expect(result).toStrictEqual({})
  })

  test('set calls yar.set once', () => {
    sessionHandler.set(request, MOCK_KEY, mockObject)
    expect(mockSet).toHaveBeenCalledTimes(1)
  })

  test('set calls yar.set with key and object', () => {
    sessionHandler.set(request, MOCK_KEY, mockObject)
    expect(mockSet).toHaveBeenCalledWith(MOCK_KEY, mockObject)
  })

  test('update calls yar.get once', () => {
    sessionHandler.update(request, MOCK_KEY, mockObject)
    expect(mockGet).toHaveBeenCalledTimes(1)
  })

  test('update calls yar.get with key', () => {
    sessionHandler.update(request, MOCK_KEY, mockObject)
    expect(mockGet).toHaveBeenCalledWith(MOCK_KEY)
  })

  test('update calls yar.set once', () => {
    sessionHandler.update(request, MOCK_KEY, mockObject)
    expect(mockSet).toHaveBeenCalledTimes(1)
  })

  test('set calls yar.set with key and object when no existing object', () => {
    sessionHandler.set(request, MOCK_KEY, mockObject)
    expect(mockSet).toHaveBeenCalledWith(MOCK_KEY, mockObject)
  })

  test('set calls yar.set with key and object when existing object is same', () => {
    mockGet.mockReturnValue(mockObject)
    sessionHandler.set(request, MOCK_KEY, mockObject)
    expect(mockSet).toHaveBeenCalledWith(MOCK_KEY, mockObject)
  })

  test('set calls yar.set with key and updated object when existing object property is changed', () => {
    mockGet.mockReturnValue(mockObject)
    const updatedObject = mockObject
    updatedObject.foo = 'baz'
    sessionHandler.set(request, MOCK_KEY, updatedObject)
    expect(mockSet).toHaveBeenCalledWith(MOCK_KEY, updatedObject)
  })

  test('set calls yar.set with key and updated object when existing object property is added', () => {
    mockGet.mockReturnValue(mockObject)
    const updatedObject = mockObject
    updatedObject.mar = 'baz'
    sessionHandler.set(request, MOCK_KEY, updatedObject)
    expect(mockSet).toHaveBeenCalledWith(MOCK_KEY, updatedObject)
  })

  test('set calls yar.set with key and updated object when existing object property is removed', () => {
    mockGet.mockReturnValue(mockObject)
    const updatedObject = mockObject
    delete updatedObject.foo
    sessionHandler.set(request, MOCK_KEY, updatedObject)
    expect(mockSet).toHaveBeenCalledWith(MOCK_KEY, updatedObject)
  })

  test('set calls yar.set with key and updated object when existing object property type changes', () => {
    mockGet.mockReturnValue(mockObject)
    const updatedObject = mockObject
    updatedObject.foo = 123
    sessionHandler.set(request, MOCK_KEY, updatedObject)
    expect(mockSet).toHaveBeenCalledWith(MOCK_KEY, updatedObject)
  })

  test('set calls yar.set with key and updated object without merging arrays', () => {
    mockObject.arr = ['a', 'b']
    mockGet.mockReturnValue(mockObject)
    const updatedObject = mockObject
    updatedObject.arr = ['c', 'd']
    sessionHandler.set(request, MOCK_KEY, updatedObject)
    expect(mockSet).toHaveBeenCalledWith(MOCK_KEY, updatedObject)
  })

  test('clear calls yar.clear once', () => {
    sessionHandler.clear(request, MOCK_KEY)
    expect(mockClear).toHaveBeenCalledTimes(1)
  })

  test('clear calls yar.clear with key', () => {
    sessionHandler.clear(request, MOCK_KEY)
    expect(mockClear).toHaveBeenCalledWith(MOCK_KEY)
  })
})
