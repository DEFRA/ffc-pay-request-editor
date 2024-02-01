const convertToCSV = require('../../app/convert-to-csv')

describe('Convert to CSV', () => {
  test('entry point starts server', () => {
    const mockData = [{
      scheme: 'SFI',
      frn: 9876543210,
      agreementNumber: 'Manual enrichment',
      netValue: '£123.00',
      debtType: 'Irregular',
      dateOfDiscovery: '2023-09-11',
      createdBy: 'Frank Edwin Wright III',
      status: 'Pending'
    }]
    const response = convertToCSV(mockData)
    console.log(response)
    expect(response).toBe('"scheme","frn","agreementNumber","netValue","debtType","dateOfDiscovery","createdBy","status"\n"SFI","9876543210","Manual enrichment","£123.00","Irregular","2023-09-11","Frank Edwin Wright III","Pending"')
  })
})
