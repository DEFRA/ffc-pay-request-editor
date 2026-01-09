const { SFI, SFI_PILOT, LUMP_SUMS, VET_VISITS, CS, BPS, SFI23, DELINKED, SFI_EXPANDED, COHTR, COHTC } = require('../../../app/constants/schemes')
const splitToLedger = require('../../../app/processing/ledger/split-to-ledger')
const { AP, AR } = require('../../../app/processing/ledger/ledgers')

describe('split ledger test', () => {
  test('splits AP across ledgers if settlement less than current value', () => {
    const paymentRequest = { ledger: AP, value: 1000, schemeId: 1, agreementNumber: '12345678', invoiceNumber: 'S12345678SFI123456V002', paymentRequestNumber: 2, invoiceLines: [{ description: 'G00', value: 1000 }] }
    const splitLedger = splitToLedger(paymentRequest, 800, AR)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.find(x => x.ledger === AP).value).toBe(200)
    expect(splitLedger.find(x => x.ledger === AR).value).toBe(800)
  })

  test('splits AR across ledgers if settlement less than current value', () => {
    const paymentRequest = { ledger: AR, value: -1000, schemeId: 1, agreementNumber: '12345678', invoiceNumber: 'S12345678SFI123456V002', paymentRequestNumber: 2, invoiceLines: [{ description: 'G00', value: -1000 }] }
    const splitLedger = splitToLedger(paymentRequest, -800, AP)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.find(x => x.ledger === AP).value).toBe(-800)
    expect(splitLedger.find(x => x.ledger === AR).value).toBe(-200)
  })

  const schemeTests = [
    { schemeId: SFI, invoiceNumber: 'S12345678SFI123456V002', invoicePrefix: 'S1234567' },
    { schemeId: SFI_PILOT, invoiceNumber: 'S12345678SFI123456V002', invoicePrefix: 'S1234567' },
    { schemeId: LUMP_SUMS, invoiceNumber: 'S12345678SFI123456V002', invoicePrefix: 'S1234567' },
    { schemeId: VET_VISITS, invoiceNumber: 'AHWR1234567890V002', invoicePrefix: 'AHWR1234567890' },
    { schemeId: CS, invoiceNumber: 'S12345678A123456V002', invoicePrefix: 'S1234567' },
    { schemeId: BPS, invoiceNumber: 'S12345678C123456V002', invoicePrefix: 'S1234567' },
    { schemeId: SFI23, invoiceNumber: 'S12345678SFI123456V002', invoicePrefix: 'S1234567' },
    { schemeId: DELINKED, invoiceNumber: 'D12345678SFI123456V002', invoicePrefix: 'D1234567' },
    { schemeId: SFI_EXPANDED, invoiceNumber: 'E12345678E123456V002', invoicePrefix: 'E1234567' },
    { schemeId: COHTR, invoiceNumber: 'E12345678E123456V002', invoicePrefix: 'E1234567' },
    { schemeId: COHTC, invoiceNumber: 'C12345678H123456V002', invoicePrefix: 'C1234567' }
  ]

  test.each(schemeTests)('updates invoice numbers correctly for scheme %#', ({ schemeId, invoiceNumber, invoicePrefix }) => {
    const paymentRequest = {
      ledger: AP,
      value: 1000,
      schemeId,
      agreementNumber: '12345678',
      invoiceNumber,
      paymentRequestNumber: 2,
      invoiceLines: [{ description: 'G00', value: 1000 }]
    }
    const splitLedger = splitToLedger(paymentRequest, 800, AR)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith(invoicePrefix + 'A')).length).toBe(1)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith(invoicePrefix + 'B')).length).toBe(1)
  })
})
