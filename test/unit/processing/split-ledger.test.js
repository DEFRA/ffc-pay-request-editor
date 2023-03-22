const { SFI, SFI_PILOT, LUMP_SUMS, VET_VISITS, CS, BPS, FDMR } = require('../../../app/constants/schemes')

describe('split ledger test', () => {
  const splitToLedger = require('../../../app/processing/ledger/split-to-ledger')
  const { AP, AR } = require('../../../app/processing/ledger/ledgers')

  test('should split AP across ledgers if settlement less than current value', async () => {
    const paymentRequest = {
      ledger: AP,
      value: 1000,
      schemeId: 1,
      agreementNumber: '12345678',
      invoiceNumber: 'S12345678SFI123456V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: 1000
      }]
    }
    const splitLedger = splitToLedger(paymentRequest, 800, AR)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.find(x => x.ledger === AP).value).toBe(200)
    expect(splitLedger.find(x => x.ledger === AR).value).toBe(800)
  })

  test('should split AR across ledgers if settlement less than current value', async () => {
    const paymentRequest = {
      ledger: AR,
      value: -1000,
      schemeId: 1,
      agreementNumber: '12345678',
      invoiceNumber: 'S12345678SFI123456V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: -1000
      }]
    }
    const splitLedger = splitToLedger(paymentRequest, -800, AP)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.find(x => x.ledger === AP).value).toBe(-800)
    expect(splitLedger.find(x => x.ledger === AR).value).toBe(-200)
  })

  test('should update invoice numbers for SFI', () => {
    const paymentRequest = {
      ledger: AP,
      value: 1000,
      schemeId: SFI,
      agreementNumber: '12345678',
      invoiceNumber: 'S12345678SFI123456V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: 1000
      }]
    }
    const splitLedger = splitToLedger(paymentRequest, 800, AR)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('S1234567A')).length).toBe(1)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('S1234567B')).length).toBe(1)
  })

  test('should update invoice numbers for SFI Pilot', () => {
    const paymentRequest = {
      ledger: AP,
      value: 1000,
      schemeId: SFI_PILOT,
      agreementNumber: '12345678',
      invoiceNumber: 'S12345678SFI123456V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: 1000
      }]
    }
    const splitLedger = splitToLedger(paymentRequest, 800, AR)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('S1234567A')).length).toBe(1)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('S1234567B')).length).toBe(1)
  })

  test('should update invoice numbers for Lump Sums', () => {
    const paymentRequest = {
      ledger: AP,
      value: 1000,
      schemeId: LUMP_SUMS,
      agreementNumber: '12345678',
      invoiceNumber: 'S12345678SFI123456V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: 1000
      }]
    }
    const splitLedger = splitToLedger(paymentRequest, 800, AR)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('S1234567A')).length).toBe(1)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('S1234567B')).length).toBe(1)
  })

  test('should update invoice numbers for Vet Visits', () => {
    const paymentRequest = {
      ledger: AP,
      value: 1000,
      schemeId: VET_VISITS,
      agreementNumber: '12345678',
      invoiceNumber: 'AHWR1234567890V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: 1000
      }]
    }
    const splitLedger = splitToLedger(paymentRequest, 800, AR)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('AHWR1234567890AV02')).length).toBe(1)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('AHWR1234567890BV02')).length).toBe(1)
  })

  test('should update invoice numbers for CS', () => {
    const paymentRequest = {
      ledger: AP,
      value: 1000,
      schemeId: CS,
      agreementNumber: '12345678',
      invoiceNumber: 'S12345678A123456V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: 1000
      }]
    }
    const splitLedger = splitToLedger(paymentRequest, 800, AR)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('S1234567A')).length).toBe(1)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('S1234567B')).length).toBe(1)
  })

  test('should update invoice numbers for BPS', () => {
    const paymentRequest = {
      ledger: AP,
      value: 1000,
      schemeId: BPS,
      agreementNumber: '12345678',
      invoiceNumber: 'S12345678C123456V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: 1000
      }]
    }
    const splitLedger = splitToLedger(paymentRequest, 800, AR)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('S1234567A')).length).toBe(1)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('S1234567B')).length).toBe(1)
  })

  test('should update invoice numbers for FDMR', () => {
    const paymentRequest = {
      ledger: AP,
      value: 1000,
      schemeId: CS,
      agreementNumber: '12345678',
      invoiceNumber: 'F12345678C123456V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: 1000
      }]
    }
    const splitLedger = splitToLedger(paymentRequest, 800, AR)
    expect(splitLedger.length).toBe(2)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('F1234567A')).length).toBe(1)
    expect(splitLedger.filter(x => x.invoiceNumber.startsWith('F1234567B')).length).toBe(1)
  })
})
