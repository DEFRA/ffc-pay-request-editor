describe('App Insight', () => {
  const appInsights = require('applicationinsights')
  jest.mock('applicationinsights')

  const startMock = jest.fn()
  const setupMock = jest.fn(() => {
    return {
      start: startMock
    }
  })
  appInsights.setup = setupMock
  const cloudRoleTag = 'cloudRoleTag'
  const tags = {}
  appInsights.defaultClient = {
    context: {
      keys: {
        cloudRole: cloudRoleTag
      },
      tags
    }
  }

  const consoleLogSpy = jest.spyOn(console, 'log')

  const appInsightsKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY

  beforeEach(() => {
    delete process.env.APPINSIGHTS_INSTRUMENTATIONKEY
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env.APPINSIGHTS_INSTRUMENTATIONKEY = appInsightsKey
  })

  test('does not setup application insights if no connection string present', () => {
    const appInsights = require('../../app/insights')
    process.env.APPINSIGHTS_CONNECTIONSTRING = undefined
    appInsights.setup()
    expect(applicationInsights.setup.mock.calls.length).toBe(0)
  })

  test('does setup application insights if connection string present', () => {
    const appInsights = require('../../app/insights')
    process.env.APPINSIGHTS_CONNECTIONSTRING = 'test-key'
    appInsights.setup()
    expect(applicationInsights.setup.mock.calls.length).toBe(1)
  })
})
