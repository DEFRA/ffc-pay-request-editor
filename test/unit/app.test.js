jest.mock('../../app/messaging')
jest.mock('../../app/update-schemes-database', () => ({
  updateSchemesDatabase: jest.fn()
}))

describe('Entry point test', () => {
  test('entry point starts server', () => {
    const mockStart = jest.fn()
    jest.mock('../../app/server', () => jest.fn(() => {
      return {
        then: mockStart.mockReturnThis(),
        catch: jest.fn()
      }
    }))
    require('../../app')
    expect(mockStart.mock.calls.length).toBe(1)
  })
})
