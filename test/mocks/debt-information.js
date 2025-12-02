const { NOT_READY } = require('../../app/quality-check/statuses')

const mockDebt1 = {
  debtDataId: 2,
  schemeId: null,
  frn: 1234567890,
  reference: 'SIP00000000000001',
  netValue: 15000,
  debtType: null,
  recoveryDate: null,
  attachedDate: null,
  createdDate: null
}

const mockDebt2 = {
  debtDataId: 1,
  paymentRequestId: null,
  schemeId: 1,
  frn: '1234567890',
  reference: '123',
  netValue: '100',
  debtType: 'irr',
  recoveryDate: '20/01/2023',
  attachedDate: null,
  createdDate: '2018-02-22T11:44:06.157Z',
  createdBy: 'Developer',
  createdById: 'cx24291'
}

const mockQuality = {
  qualityCheckId: 1,
  checkedDate: null,
  checkedBy: null,
  status: NOT_READY
}

const expectedDebt = {
  debtDataId: 1,
  paymentRequestId: null,
  schemeId: 1,
  frn: '1234567890',
  reference: '123',
  netValue: '100',
  netValueText: '£1.00',
  debtType: 'irr',
  debtTypeText: 'Irregular',
  recoveryDate: '20/01/2023',
  attachedDate: null,
  createdDate: new Date('2018-02-22T11:44:06.157Z'),
  createdBy: 'Developer',
  createdById: 'cx24291'
}

const mockRequest = {
  sourceSystem: 'SFIP',
  deliveryBody: 'RP00',
  invoiceNumber: 'S00000001SFIP000001V001',
  frn: 1234567890,
  sbi: 123456789,
  paymentRequestNumber: 40,
  agreementNumber: 'SIP00000000000001',
  contractNumber: 'SFIP000001',
  marketingYear: 2022,
  currency: 'GBP',
  schedule: 'M12',
  dueDate: '2015-08-15',
  value: 15000,
  invoiceLines: [
    {
      schemeCode: '80001',
      accountCode: 'SOS273',
      fundCode: 'DRD10',
      description: 'G00 - Gross value of claim',
      value: 25000
    },
    {
      schemeCode: '80001',
      accountCode: 'SOS273',
      fundCode: 'DRD10',
      description: 'P02 - Over declaration penalty',
      value: -10000
    }
  ]
}

module.exports = { mockDebt1, mockDebt2, expectedDebt, mockQuality, mockRequest }
