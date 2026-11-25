const mockRoles = ['test-role']
const mockAccount = 'test-account'

const mockGetAuthCodeUrl = jest.fn()
const mockAcquireTokenByCode = jest.fn().mockResolvedValue({
  idTokenClaims: { roles: mockRoles },
  account: mockAccount
})
const mockAcquireTokenSilent = jest.fn().mockResolvedValue({
  idTokenClaims: { roles: mockRoles },
  account: mockAccount
})
const mockRemoveAccount = jest.fn()
const mockGetTokenCache = jest.fn().mockReturnValue({ removeAccount: mockRemoveAccount })

jest.mock('@azure/msal-node', () => ({
  ConfidentialClientApplication: jest.fn().mockImplementation(() => ({
    getAuthCodeUrl: mockGetAuthCodeUrl,
    acquireTokenByCode: mockAcquireTokenByCode,
    acquireTokenSilent: mockAcquireTokenSilent,
    getTokenCache: mockGetTokenCache
  })),
  LogLevel: { Verbose: 'verbose' }
}))

const azureAuth = require('../../../app/auth/azure-auth')
const { authConfig } = require('../../../app/config')

describe('azure authentication', () => {
  let mockCookieAuth

  beforeEach(() => {
    jest.clearAllMocks()
    mockCookieAuth = { set: jest.fn() }
  })

  describe('getAuthenticationUrl', () => {
    test('should call getAuthCodeUrl once with correct params', () => {
      azureAuth.getAuthenticationUrl()
      expect(mockGetAuthCodeUrl).toHaveBeenCalledTimes(1)
      const params = mockGetAuthCodeUrl.mock.calls[0][0]
      expect(params.prompt).toBe('select_account')
      expect(params.redirectUri).toBe(authConfig.redirectUrl)
    })
  })

  describe('authenticate', () => {
    beforeEach(async () => {
      await azureAuth.authenticate('redirectCode', mockCookieAuth)
    })

    test('should call acquireTokenByCode once with correct params', () => {
      const callParams = mockAcquireTokenByCode.mock.calls[0][0]
      expect(mockAcquireTokenByCode).toHaveBeenCalledTimes(1)
      expect(callParams.code).toBe('redirectCode')
      expect(callParams.redirectUri).toBe(authConfig.redirectUrl)
      expect(callParams.scopes).toEqual(['openid', 'profile', 'offline_access'])
    })

    test('should set account and scope in cookieAuth', () => {
      expect(mockCookieAuth.set).toHaveBeenCalledTimes(1)
      const cookieParams = mockCookieAuth.set.mock.calls[0][0]
      expect(cookieParams.account).toBe(mockAccount)
      expect(cookieParams.scope).toBe(mockRoles)
    })
  })

  describe('refresh', () => {
    test.each([
      [undefined, true],
      [true, true],
      [false, false]
    ])('should call acquireTokenSilent with forceRefresh=%s', async (input, expectedForce) => {
      await azureAuth.refresh(mockAccount, mockCookieAuth, input)
      const callParams = mockAcquireTokenSilent.mock.calls[0][0]
      expect(callParams.account).toBe(mockAccount)
      expect(callParams.forceRefresh).toBe(expectedForce)
      expect(callParams.scopes).toEqual(['openid', 'profile', 'offline_access'])

      expect(mockCookieAuth.set).toHaveBeenCalledTimes(1)
      const cookieParams = mockCookieAuth.set.mock.calls[0][0]
      expect(cookieParams.account).toBe(mockAccount)
      expect(cookieParams.scope).toBe(mockRoles)
    })

    test('should return roles on successful refresh', async () => {
      const result = await azureAuth.refresh(mockAccount, mockCookieAuth)
      expect(result).toBe(mockRoles)
    })

    test('should return null on error during refresh', async () => {
      mockAcquireTokenSilent.mockRejectedValueOnce(new Error('Refresh error'))
      const result = await azureAuth.refresh(mockAccount, mockCookieAuth)
      expect(result).toBeNull()
      expect(mockCookieAuth.set).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    beforeEach(async () => {
      await azureAuth.logout(mockAccount)
    })

    test('should call removeAccount once with account', () => {
      expect(mockRemoveAccount).toHaveBeenCalledTimes(1)
      expect(mockRemoveAccount).toHaveBeenCalledWith(mockAccount)
    })

    test('should handle error during removeAccount gracefully', async () => {
      const error = new Error('Remove account error')
      mockRemoveAccount.mockRejectedValueOnce(error)
      await azureAuth.logout(mockAccount)
      expect(mockRemoveAccount).toHaveBeenCalledWith(mockAccount)
    })
  })
})
