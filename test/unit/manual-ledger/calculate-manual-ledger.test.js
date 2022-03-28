describe('Calculate manual ledger test', () => {
  const calculateManualLedger = require('../../../app/manual-ledger/calculate-manual-ledger')
  jest.mock('../../../app/manual-ledger/get-manual-ledger')
  const getManualLedger = require('../../../app/manual-ledger/get-manual-ledger')
  const { AP, AR } = require('../../../app/processing/ledger/ledgers')

  test('should split AP across ledgers if settlement less than current value', async () => {
    const arValue = 800
    const apValue = 200

    const paymentRequest = {
      paymentRequestId: 2,
      ledger: AP,
      value: 1000,
      agreementNumber: '12345678',
      invoiceNumber: 'S12345678SFI123456V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: 1000
      }]
    }

    getManualLedger.mockResolvedValue(paymentRequest)

    const calculate = await calculateManualLedger(paymentRequest.paymentRequestId, arValue, apValue)
    expect(calculate.manualLedgerChecks.length).toBe(2)
    expect(calculate.manualLedgerChecks.find(x => x.ledgerPaymentRequest.ledger === AP).ledgerPaymentRequest.value).toBe(200)
    expect(calculate.manualLedgerChecks.find(x => x.ledgerPaymentRequest.ledger === AR).ledgerPaymentRequest.value).toBe(800)
  })

  test('should split AR across ledgers if settlement less than current value', async () => {
    const arValue = -800
    const apValue = -200

    const paymentRequest = {
      ledger: AR,
      value: -1000,
      agreementNumber: '12345678',
      invoiceNumber: 'S12345678SFI123456V002',
      paymentRequestNumber: 2,
      invoiceLines: [{
        description: 'G00',
        value: -1000
      }]
    }

    getManualLedger.mockResolvedValue(paymentRequest)

    const calculate = await calculateManualLedger(paymentRequest.paymentRequestId, arValue, apValue)
    expect(calculate.manualLedgerChecks.length).toBe(2)
    expect(calculate.manualLedgerChecks.find(x => x.ledgerPaymentRequest.ledger === AP).ledgerPaymentRequest.value).toBe(-200)
    expect(calculate.manualLedgerChecks.find(x => x.ledgerPaymentRequest.ledger === AR).ledgerPaymentRequest.value).toBe(-800)
  })

  test('should fail validation as  current value', async () => {
    const paymentRequestId = 2
    const arValue = 1800
    const apValue = 200

    const calculate = await calculateManualLedger(paymentRequestId, arValue, apValue)
    expect(Object.keys(calculate).length).toBe(0)
  })
})
