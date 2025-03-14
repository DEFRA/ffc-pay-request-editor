const config = require('../../app/config')

jest.mock('../../app/server', () =>
  jest.fn().mockResolvedValue({
    start: jest.fn()
  })
)
const createServer = require('../../app/server')

jest.mock('../../app/messaging')
const { start: mockMessagingStart } = require('../../app/messaging')

const startApp = require('../../app')

describe('app start', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('starts server when active is true', async () => {
    config.processingActive = true
    await startApp()
    expect(createServer).toHaveBeenCalledTimes(1)
  })

  test('starts server if active is false', async () => {
    config.processingActive = false
    await startApp()
    expect(createServer).toHaveBeenCalledTimes(1)
  })

  test('starts messaging when active is true', async () => {
    config.processingActive = true
    await startApp()
    expect(mockMessagingStart).toHaveBeenCalledTimes(1)
  })

  test('does not start messaging when active is false', async () => {
    config.processingActive = false
    await startApp()
    expect(mockMessagingStart).toHaveBeenCalledTimes(0)
  })

  test('does not log console.info when active is true', async () => {
    config.processingActive = true
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
    await startApp()
    expect(consoleInfoSpy).not.toHaveBeenCalled()
    consoleInfoSpy.mockRestore()
  })

  test('logs console.info when active is false', async () => {
    config.processingActive = false
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
    await startApp()
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Processing capabilities are currently not enabled in this environment')
    )
    consoleInfoSpy.mockRestore()
  })
})
