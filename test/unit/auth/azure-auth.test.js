const mockRoles = ['test-role']
const mockAccount = {
  homeAccountId: 'home-account-id',
  environment: 'login.microsoftonline.com',
  tenantId: 'tenant-id',
  username: 'test@example.com',
  localAccountId: 'local-account-id',
  name: 'Test User'
}
const mockFullAccount = {
  ...mockAccount,
  idTokenClaims: { roles: mockRoles },
  extraProperty: 'should not be stored in cookie'
}
const mockGetAuthCodeUrl = jest.fn()
const mockAcquireTokenByCode = jest.fn()
const mockAcquireTokenSilent = jest.fn()
const mockRemoveAccount = jest.fn()
const mockGetAccountByHomeId = jest.fn()
const mockGetTokenCache = jest.fn(() => ({
  removeAccount: mockRemoveAccount,
  getAccountByHomeId: mockGetAccountByHomeId
}))

jest.mock('@azure/msal-node', () => ({
  ConfidentialClientApplication: jest.fn(() => ({
    getAuthCodeUrl: mockGetAuthCodeUrl,
    acquireTokenByCode: mockAcquireTokenByCode,
    acquireTokenSilent: mockAcquireTokenSilent,
    getTokenCache: mockGetTokenCache
  })),
  LogLevel: { Verbose: 'verbose' }
}))

const azureAuth = require('../../../app/auth/azure-auth')
const { authConfig } = require('../../../app/config')
const authScopes = ['openid', 'profile', 'offline_access']

describe('azure authentication', () => {
  let mockCookieAuth
  let consoleErrorSpy
  let consoleWarnSpy

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetAccountByHomeId.mockResolvedValue(mockFullAccount)
    mockAcquireTokenByCode.mockResolvedValue({
      idTokenClaims: { roles: mockRoles },
      account: mockFullAccount
    })
    mockAcquireTokenSilent.mockResolvedValue({
      idTokenClaims: { roles: mockRoles },
      account: mockFullAccount
    })
    mockCookieAuth = { set: jest.fn() }
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { })
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  describe('getAuthenticationUrl', () => {
    test('calls getAuthCodeUrl with prompt, redirect and scopes', async () => {
      await azureAuth.getAuthenticationUrl()
      expect(mockGetAuthCodeUrl).toHaveBeenCalledTimes(1)
      expect(mockGetAuthCodeUrl).toHaveBeenCalledWith({
        prompt: 'select_account',
        redirectUri: authConfig.redirectUrl,
        scopes: authScopes
      })
    })
  })

  describe('authenticate', () => {
    test('acquires a token using the authorization code and matching scopes', async () => {
      await azureAuth.authenticate('redirectCode', mockCookieAuth)
      expect(mockAcquireTokenByCode).toHaveBeenCalledTimes(1)
      expect(mockAcquireTokenByCode).toHaveBeenCalledWith({
        code: 'redirectCode',
        redirectUri: authConfig.redirectUrl,
        scopes: authScopes
      })
    })

    test('stores only the reduced account and roles in the cookie', async () => {
      await azureAuth.authenticate('redirectCode', mockCookieAuth)
      expect(mockCookieAuth.set).toHaveBeenCalledTimes(1)
      expect(mockCookieAuth.set).toHaveBeenCalledWith({
        scope: mockRoles,
        account: mockAccount
      })
      expect(mockCookieAuth.set.mock.calls[0][0].account).not.toHaveProperty('idTokenClaims')
      expect(mockCookieAuth.set.mock.calls[0][0].account).not.toHaveProperty('extraProperty')
    })

    test('returns the complete authentication result', async () => {
      const result = await azureAuth.authenticate('redirectCode', mockCookieAuth)
      expect(result).toEqual({
        idTokenClaims: { roles: mockRoles },
        account: mockFullAccount
      })
    })

    test('rejects a missing authorization code without calling MSAL', async () => {
      await expect(azureAuth.authenticate(undefined, mockCookieAuth))
        .rejects.toThrow('No authorization code was returned by Microsoft Entra ID')
      expect(mockAcquireTokenByCode).not.toHaveBeenCalled()
      expect(mockCookieAuth.set).not.toHaveBeenCalled()
    })

    test.each([
      [null, { roles: mockRoles }],
      [mockFullAccount, null],
      [undefined, { roles: mockRoles }],
      [mockFullAccount, undefined]
    ])('rejects an incomplete token with account=%s and claims=%s', async (account, idTokenClaims) => {
      mockAcquireTokenByCode.mockResolvedValueOnce({ account, idTokenClaims })
      await expect(azureAuth.authenticate('redirectCode', mockCookieAuth))
        .rejects.toThrow('Microsoft Entra ID returned an incomplete authentication result')
      expect(mockCookieAuth.set).not.toHaveBeenCalled()
    })

    test('rethrows an MSAL error rather than silently redirecting', async () => {
      const error = new Error('Token acquisition failed')
      mockAcquireTokenByCode.mockRejectedValueOnce(error)
      await expect(azureAuth.authenticate('redirectCode', mockCookieAuth)).rejects.toBe(error)
      expect(mockCookieAuth.set).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to acquire token by code:', {
        name: 'Error',
        message: 'Token acquisition failed',
        errorCode: undefined,
        correlationId: undefined
      })
    })
  })

  describe('refresh', () => {
    test.each([
      [undefined, false],
      [true, true],
      [false, false]
    ])('resolves the cached account and uses forceRefresh=%s', async (input, expectedForce) => {
      await azureAuth.refresh(mockAccount, mockCookieAuth, input)
      expect(mockGetAccountByHomeId).toHaveBeenCalledWith(mockAccount.homeAccountId)
      expect(mockAcquireTokenSilent).toHaveBeenCalledWith({
        account: mockFullAccount,
        scopes: authScopes,
        forceRefresh: expectedForce
      })
      expect(mockCookieAuth.set).toHaveBeenCalledWith({
        scope: mockRoles,
        account: mockAccount
      })
    })

    test('returns roles on successful refresh', async () => {
      expect(await azureAuth.refresh(mockAccount, mockCookieAuth)).toBe(mockRoles)
    })

    test('returns null if the account is absent from the cache', async () => {
      mockGetAccountByHomeId.mockResolvedValueOnce(null)
      expect(await azureAuth.refresh(mockAccount, mockCookieAuth)).toBeNull()
      expect(mockAcquireTokenSilent).not.toHaveBeenCalled()
      expect(mockCookieAuth.set).not.toHaveBeenCalled()
    })

    test('returns null without lookup if homeAccountId is missing', async () => {
      expect(await azureAuth.refresh({}, mockCookieAuth)).toBeNull()
      expect(mockGetAccountByHomeId).not.toHaveBeenCalled()
      expect(mockAcquireTokenSilent).not.toHaveBeenCalled()
    })

    test.each([
      [null, { roles: mockRoles }],
      [mockFullAccount, null]
    ])('returns null for incomplete refresh token with account=%s', async (account, idTokenClaims) => {
      mockAcquireTokenSilent.mockResolvedValueOnce({ account, idTokenClaims })
      expect(await azureAuth.refresh(mockAccount, mockCookieAuth)).toBeNull()
      expect(mockCookieAuth.set).not.toHaveBeenCalled()
    })

    test('returns null and logs structured details on MSAL failure', async () => {
      mockAcquireTokenSilent.mockRejectedValueOnce(new Error('Refresh error'))
      expect(await azureAuth.refresh(mockAccount, mockCookieAuth)).toBeNull()
      expect(mockCookieAuth.set).not.toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to acquire token on silent refresh:', {
        name: 'Error',
        message: 'Refresh error',
        errorCode: undefined,
        correlationId: undefined
      })
    })
  })

  describe('logout', () => {
    test('removes the complete cached account', async () => {
      await azureAuth.logout(mockAccount)
      expect(mockGetAccountByHomeId).toHaveBeenCalledWith(mockAccount.homeAccountId)
      expect(mockRemoveAccount).toHaveBeenCalledTimes(1)
      expect(mockRemoveAccount).toHaveBeenCalledWith(mockFullAccount)
    })

    test('does not remove an account absent from the cache', async () => {
      mockGetAccountByHomeId.mockResolvedValueOnce(null)
      await azureAuth.logout(mockAccount)
      expect(mockRemoveAccount).not.toHaveBeenCalled()
    })

    test('handles removeAccount errors gracefully', async () => {
      mockRemoveAccount.mockRejectedValueOnce(new Error('Remove account error'))
      await expect(azureAuth.logout(mockAccount)).resolves.toBeUndefined()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unable to end session',
        expect.objectContaining({ message: 'Remove account error' })
      )
    })
  })
})
