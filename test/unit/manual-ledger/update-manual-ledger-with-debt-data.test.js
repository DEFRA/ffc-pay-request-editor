jest.mock('../../../app/config')
const config = require('../../../app/config')

describe('bluh', async () => {
  test('1', async () => {
    config.isAlerting = true

    expect(config.isAlerting).toBe(true)
  })
})
