module.exports = [{
  scheduleId: 2,
  paymentRequest: {
    paymentRequestId: 2,
    schemeId: 2,
    sourceSystem: 'SFIP',
    deliveryBody: 'RP00',
    invoiceNumber: 'S123456789A123456V002',
    frn: '1234567890',
    sbi: null,
    ledger: 'AP',
    marketingYear: 2022,
    agreementNumber: 'SFI12345',
    contractNumber: 'SFI12345',
    paymentRequestNumber: 2,
    currency: 'GBP',
    schedule: 'Q4',
    dueDate: '09/11/2022',
    debtType: 'irr',
    recoveryDate: '2022-01-18',
    originalSettlementDate: null,
    value: 90000,
    received: '2022-03-02T11:27:35.560Z',
    invoiceLines: [
      {
        invoiceLineId: 2,
        paymentRequestId: 2,
        schemeCode: '80001',
        accountCode: 'SOS100',
        fundCode: 'DOM00',
        description: 'G00 - Gross value of claim',
        value: 90000
      }
    ],
    scheme: {
      schemeId: 2,
      name: 'SFI Pilot',
      active: true
    }
  },
  paymetRequests: [
    {
      paymentRequestId: 2,
      schemeId: 2,
      sourceSystem: 'SFIP',
      deliveryBody: 'RP00',
      invoiceNumber: 'S123456789A123456V002',
      frn: '1234567890',
      sbi: null,
      ledger: 'AR',
      marketingYear: 2022,
      agreementNumber: 'SFI12345',
      contractNumber: 'SFI12345',
      paymentRequestNumber: 2,
      currency: 'GBP',
      schedule: 'Q4',
      dueDate: '09/11/2022',
      debtType: 'irr',
      recoveryDate: '2022-01-18',
      value: -10000,
      received: '2022-03-02T11:27:35.560Z',
      invoiceLines: [
        {
          schemeCode: '80001',
          fundCode: 'DOM00',
          description: 'G00 - Gross value of claim',
          value: -10000,
          accountCode: null
        }
      ],
      scheme: {
        schemeId: 2,
        name: 'SFI Pilot',
        active: true
      },
      settledValue: 0
    }
  ]
}]
