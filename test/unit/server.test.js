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
    mockObject = { foo: 'bar' }
  })

  // -----------------------------
  // GET Tests
  // -----------------------------
  test('get returns object if it exists', () => {
    mockGet.mockReturnValue(mockObject)
    const result = sessionHandler.get(request, MOCK_KEY)
    expect(result).toStrictEqual(mockObject)
  })

  test('get returns empty object if key not found', () => {
    mockGet.mockReturnValue(null)
    const result = sessionHandler.get(request, MOCK_KEY)
    expect(result).toStrictEqual({})
  })

  // -----------------------------
  // SET Tests
  // -----------------------------
  const setScenarios = [
    {
      desc: 'no existing object',
      existing: null,
      update: { foo: 'bar' },
      expected: { foo: 'bar' }
    },
    {
      desc: 'unchanged object',
      existing: { foo: 'bar' },
      update: { foo: 'bar' },
      expected: { foo: 'bar' }
    },
    {
      desc: 'property updated',
      existing: { foo: 'bar' },
      update: { foo: 'baz' },
      expected: { foo: 'baz' }
    },
    {
      desc: 'property added',
      existing: { foo: 'bar' },
      update: { foo: 'bar', mar: 'baz' },
      expected: { foo: 'bar', mar: 'baz' }
    },
    {
      desc: 'property removed',
      existing: { foo: 'bar' },
      update: {},
      expected: {}
    },
    {
      desc: 'array replaced',
      existing: { arr: ['a', 'b'] },
      update: { arr: ['c', 'd'] },
      expected: { arr: ['c', 'd'] }
    }
  ]

  test.each(setScenarios)('set calls yar.set correctly when $desc', ({ existing, update, expected }) => {
    mockGet.mockReturnValue(existing)
    sessionHandler.set(request, MOCK_KEY, update)
    expect(mockSet).toHaveBeenCalledWith(MOCK_KEY, expected)
  })

  // -----------------------------
  // UPDATE Tests
  // -----------------------------
  test('update calls yar.get and yar.set with merged object', () => {
    mockGet.mockReturnValue({ foo: 'bar' })
    const updateObj = { baz: 'qux' }
    sessionHandler.update(request, MOCK_KEY, updateObj)
    expect(mockGet).toHaveBeenCalledWith(MOCK_KEY)
    expect(mockSet).toHaveBeenCalledWith(MOCK_KEY, { foo: 'bar', baz: 'qux' })
  })

  // -----------------------------
  // CLEAR Tests
  // -----------------------------
  test('clear calls yar.clear once with key', () => {
    sessionHandler.clear(request, MOCK_KEY)
    expect(mockClear).toHaveBeenCalledTimes(1)
    expect(mockClear).toHaveBeenCalledWith(MOCK_KEY)
  })
})
