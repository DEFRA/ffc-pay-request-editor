const accessibilityRoute = require('../../../app/routes/accessibility')

describe('GET /accessibility route handler', () => {
  test('should return the accessibility view', () => {
    const h = {
      view: jest.fn().mockReturnValue('rendered-view')
    }
    const request = {}

    const response = accessibilityRoute.options.handler(request, h)

    expect(h.view).toHaveBeenCalledWith('accessibility')
    expect(response).toBe('rendered-view')
  })
})
