const mapAuth = require('../../../app/auth/map-auth')
const { ledger, enrichment } = require('../../../app/auth/permissions')
let request

describe('is in role', () => {
  beforeEach(() => {
    request = {
      auth: {
        isAuthenticated: true,
        credentials: {
          scope: []
        }
      }
    }
  })

  test('should return isAuthenticated if authenticated', () => {
    const result = mapAuth(request)
    expect(result.isAuthenticated).toBeTruthy()
  })

  test('should not return isAuthenticated if unauthenticated', () => {
    request.auth.isAuthenticated = false
    const result = mapAuth(request)
    expect(result.isAuthenticated).not.toBeTruthy()
  })

  test('should return isAnonymous if unauthenticated', () => {
    request.auth.isAuthenticated = false
    const result = mapAuth(request)
    expect(result.isAnonymous).toBeTruthy()
  })

  test('should not return isAnonymous if authenticated', () => {
    const result = mapAuth(request)
    expect(result.isAnonymous).not.toBeTruthy()
  })

  test('should not return isEnrichmentUser if no roles', () => {
    const result = mapAuth(request)
    expect(result.isEnrichmentUser).not.toBeTruthy()
  })

  test('should not return isLedgerUser if no roles', () => {
    const result = mapAuth(request)
    expect(result.isLedgerUser).not.toBeTruthy()
  })

  test('should not return isEnrichmentUser if not in role', () => {
    request.auth.credentials.scope = [ledger]
    const result = mapAuth(request)
    expect(result.isEnrichmentUser).not.toBeTruthy()
  })

  test('should not return isLedgerUser if not in role', () => {
    request.auth.credentials.scope = [enrichment]
    const result = mapAuth(request)
    expect(result.isLedgerUser).not.toBeTruthy()
  })

  test('should return isEnrichmentUser if in role', () => {
    request.auth.credentials.scope = [enrichment]
    const result = mapAuth(request)
    expect(result.isEnrichmentUser).toBeTruthy()
  })

  test('should return isLedgerUser if in role', () => {
    request.auth.credentials.scope = [ledger]
    const result = mapAuth(request)
    expect(result.isLedgerUser).toBeTruthy()
  })
})
