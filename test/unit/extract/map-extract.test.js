const { IRREGULAR, ADMINISTRATIVE } = require('../../../app/constants/debt-types')
const { mapExtract } = require('../../../app/extract')

describe('Map extract', () => {
  test('should correctly map data', () => {
    const debts = [{
      schemes: {
        name: 'SFI Pilot'
      },
      frn: '1234567890',
      reference: 'SFIP1234567',
      netValueText: '£1,000.00',
      debtTypeText: IRREGULAR,
      recoveryDate: '19/01/2022',
      createdBy: 'Billie Joe Armstrong',
      paymentRequestId: 23
    },
    {
      schemes: {
        name: 'SFI'
      },
      frn: '1234567891',
      netValueText: '£570.00',
      debtTypeText: ADMINISTRATIVE,
      recoveryDate: '18/01/2022',
      attachedDate: '18/01/2022',
      createdBy: 'Michael Pritchard'
    }]
    const expectedOutput = [{
      scheme: 'SFI Pilot',
      frn: '1234567890',
      agreementNumber: 'SFIP1234567',
      netValue: '£1000.00',
      debtType: IRREGULAR,
      dateOfDiscovery: '19/01/2022',
      createdBy: 'Billie Joe Armstrong',
      status: 'Attached'
    }, {
      scheme: 'SFI',
      frn: '1234567891',
      agreementNumber: 'Manual enrichment',
      netValue: '£570.00',
      debtType: ADMINISTRATIVE,
      dateOfDiscovery: '18/01/2022',
      createdBy: 'Michael Pritchard',
      status: 'Pending'
    }]
    const response = mapExtract(debts)
    expect(response).toEqual(expectedOutput)
  })
})
