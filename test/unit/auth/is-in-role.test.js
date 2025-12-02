const isInRole = require('../../../app/auth/is-in-role')

const ROLE_1 = 'role1'
const ROLE_2 = 'role2'
const ROLE_3 = 'role3'

describe('is in role', () => {
  let credentials

  beforeEach(() => {
    credentials = { scope: [ROLE_1, ROLE_2] }
  })

  test('should return true if in role', () => {
    expect(isInRole(credentials, ROLE_1)).toBeTruthy()
  })

  test.each([
    [{ scope: [ROLE_1, ROLE_2] }, ROLE_3, false],
    [{ scope: [] }, ROLE_3, false],
    [{}, ROLE_3, false],
    [null, ROLE_3, false],
    [undefined, ROLE_3, false]
  ])('should return %s when credentials=%o and role=%s', (creds, role, expected) => {
    expect(isInRole(creds, role)).toBe(expected)
  })
})
