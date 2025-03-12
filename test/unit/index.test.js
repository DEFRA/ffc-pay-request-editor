const config = require('../../app/config')

jest.mock('../../app/server', () =>
  jest.fn().mockResolvedValue({
    start: jest.fn()
  })
)

const createServer = require('../../app/server')

const startApp = require('../../app')

describe('app start', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('starts processing when active is true', async () => {
    config.processingActive = true
    await startApp()
    expect(createServer).toHaveBeenCalledTimes(1)
  })

  test('does not start processing if active is false', async () => {
    config.processingActive = false
    await startApp()
    expect(createServer).toHaveBeenCalledTimes(0)
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
