jest.mock('ffc-pay-schemes', () => ({
  getSchemes: jest.fn()
}))
const { getSchemes: mockGetSchemes } = require('ffc-pay-schemes')

const { createKnexMock } = require('../helpers/mock-knex')

const mockDb = createKnexMock(['scheme'])

jest.mock('../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { updateSchemesDatabase } = require('../../app/update-schemes-database')

describe('update schemes database', () => {
  let consoleLogSpy

  beforeEach(() => {
    jest.clearAllMocks()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    mockDb.builder.resolves()
    mockDb.builder.first.mockImplementation(() => mockDb.builder)
    mockDb.builder.merge.mockImplementation(() => mockDb.builder)
    mockDb.builder.insert.mockImplementation(() => mockDb.builder)
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  test('should get the schemes', async () => {
    mockGetSchemes.mockReturnValue([])

    await updateSchemesDatabase()

    expect(mockGetSchemes).toHaveBeenCalledTimes(1)
  })

  test('should create a record for a new scheme', async () => {
    const scheme = {
      schemeId: 1,
      schemeName: 'Sustainable Farming Incentive 22'
    }

    mockGetSchemes.mockReturnValue([scheme])
    mockDb.builder.first.mockResolvedValue(undefined)

    await updateSchemesDatabase()

    expect(mockDb.builder.where).toHaveBeenCalledWith({ schemeId: scheme.schemeId })
    expect(mockDb.builder.insert).toHaveBeenCalledWith({
      schemeId: scheme.schemeId,
      name: scheme.schemeName
    })
    expect(mockDb.builder.onConflict).toHaveBeenCalledWith('schemeId')
    expect(mockDb.builder.merge).toHaveBeenCalledTimes(1)

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `${scheme.schemeName} created`
    )
  })

  test('should update an existing scheme record', async () => {
    const scheme = {
      schemeId: 1,
      schemeName: 'Updated scheme name'
    }

    mockGetSchemes.mockReturnValue([scheme])
    mockDb.builder.first.mockResolvedValue({ schemeId: scheme.schemeId })

    await updateSchemesDatabase()

    expect(mockDb.builder.where).toHaveBeenCalledWith({ schemeId: scheme.schemeId })
    expect(mockDb.builder.insert).toHaveBeenCalledWith({
      schemeId: scheme.schemeId,
      name: scheme.schemeName
    })
    expect(mockDb.builder.onConflict).toHaveBeenCalledWith('schemeId')

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `${scheme.schemeName} updated`
    )
  })

  test('should upsert every scheme', async () => {
    const schemes = [
      {
        schemeId: 1,
        schemeName: 'Scheme one'
      },
      {
        schemeId: 2,
        schemeName: 'Scheme two'
      }
    ]

    mockGetSchemes.mockReturnValue(schemes)
    mockDb.builder.first.mockResolvedValue(undefined)

    await updateSchemesDatabase()

    expect(mockDb.builder.first).toHaveBeenCalledTimes(schemes.length)
    expect(mockDb.builder.merge).toHaveBeenCalledTimes(schemes.length)

    for (const scheme of schemes) {
      expect(mockDb.builder.insert).toHaveBeenCalledWith({
        schemeId: scheme.schemeId,
        name: scheme.schemeName
      })
    }
  })

  test('should log that it is checking for updates', async () => {
    mockGetSchemes.mockReturnValue([])

    await updateSchemesDatabase()

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Checking for updates to supported schemes'
    )
  })

  test('should process schemes sequentially', async () => {
    const schemes = [
      {
        schemeId: 1,
        schemeName: 'Scheme one'
      },
      {
        schemeId: 2,
        schemeName: 'Scheme two'
      }
    ]

    const calls = []

    mockGetSchemes.mockReturnValue(schemes)
    mockDb.builder.first.mockResolvedValue(undefined)
    mockDb.builder.insert.mockImplementation(({ schemeId }) => {
      calls.push(schemeId)
      return mockDb.builder
    })

    await updateSchemesDatabase()

    expect(calls).toEqual([1, 2])
  })

  test('should reject if upsert fails', async () => {
    const error = new Error('Database error')

    mockGetSchemes.mockReturnValue([{
      schemeId: 1,
      schemeName: 'Scheme one'
    }])
    mockDb.builder.first.mockResolvedValue(undefined)
    mockDb.builder.merge.mockRejectedValue(error)

    await expect(updateSchemesDatabase()).rejects.toBe(error)
  })
})
