const mapAuth = require('../../../app/auth/map-auth')
const { ledger, enrichment } = require('../../../app/auth/permissions')

describe('mapAuth', () => {
  let request

  beforeEach(() => {
    request = {
      auth: {
        isAuthenticated: true,
        credentials: { scope: [] }
      }
    }
  })

  describe('authentication flags', () => {
    test('should return correct isAuthenticated and isAnonymous values', () => {
      let result = mapAuth(request)
      expect(result.isAuthenticated).toBeTruthy()
      expect(result.isAnonymous).not.toBeTruthy()

      request.auth.isAuthenticated = false
      result = mapAuth(request)
      expect(result.isAuthenticated).not.toBeTruthy()
      expect(result.isAnonymous).toBeTruthy()
    })
  })

  describe('role-based flags', () => {
    test.each([
      [[], false, false],
      [[ledger], true, false],
      [[enrichment], false, true]
    ])('scope=%p -> isLedgerUser=%p, isEnrichmentUser=%p', (scope, ledgerFlag, enrichmentFlag) => {
      request.auth.credentials.scope = scope
      const result = mapAuth(request)
      expect(result.isLedgerUser).toBe(ledgerFlag)
      expect(result.isEnrichmentUser).toBe(enrichmentFlag)
    })
  })
})
