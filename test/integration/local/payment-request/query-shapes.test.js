const db = require('../../../../app/database')
const { truncate } = require('../../../helpers/truncate')
const { getDebts } = require('../../../../app/debt')
const { getPaymentRequest } = require('../../../../app/payment-request')
const { getQualityChecks, getQualityCheckedPaymentRequests } = require('../../../../app/quality-check')
const { getInvoiceLinesOfPaymentRequest } = require('../../../../app/invoice-line')
const { ENRICHMENT } = require('../../../../app/payment-request/categories')
const { PENDING, PASSED } = require('../../../../app/quality-check/statuses')
const { IRREGULAR } = require('../../../../app/constants/debt-types')

describe('query result shapes', () => {
  beforeEach(async () => {
    await truncate()
    await db.scheme().insert([{ schemeId: 1, name: 'SFI' }, { schemeId: 2, name: 'CS' }])
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  describe('getDebts', () => {
    beforeEach(async () => {
      await db.paymentRequest().insert({ paymentRequestId: 1, schemeId: 1, frn: 1234567890 })
      await db.debtData().insert([
        { schemeId: 1, frn: 1234567890, reference: 'REF1', netValue: 150000, debtType: IRREGULAR, recoveryDate: '20/01/2023', createdDate: new Date('2023-01-01T00:00:00.000Z') },
        { schemeId: 2, frn: 1234567891, reference: 'REF2', netValue: 100, createdDate: new Date('2023-02-01T00:00:00.000Z') },
        { schemeId: 2, frn: 1234567891, reference: 'Manual enrichment', netValue: 100 },
        { paymentRequestId: 1, schemeId: 1, frn: 1234567890, reference: 'REF3', netValue: 100, createdDate: new Date('2023-03-01T00:00:00.000Z') }
      ])
    })

    test('returns unattached debts newest first with scheme and text fields, excluding manual enrichment', async () => {
      const { rows, count } = await getDebts()

      expect(count).toBe(2)
      expect(rows.map(x => x.reference)).toEqual(['REF2', 'REF1'])
      expect(rows[1].schemes).toEqual({ name: 'SFI' })
      expect(rows[1].netValueText).toBe('£1,500.00')
      expect(rows[1].debtTypeText).toBe('Irregular')
    })

    test('includes attached debts when requested', async () => {
      const { rows, count } = await getDebts({ includeAttached: true })

      expect(count).toBe(3)
      expect(rows.map(x => x.reference)).toEqual(['REF3', 'REF2', 'REF1'])
    })

    test('filters by frn and scheme', async () => {
      expect((await getDebts({ frn: 1234567891 })).rows.map(x => x.reference)).toEqual(['REF2'])
      expect((await getDebts({ scheme: 'SFI' })).rows.map(x => x.reference)).toEqual(['REF1'])
      expect((await getDebts({ scheme: 'SFI', frn: 1234567891 })).count).toBe(0)
    })

    test('paginates but reports the full count', async () => {
      const page = await getDebts({ page: 2, pageSize: 1 })

      expect(page.count).toBe(2)
      expect(page.rows.map(x => x.reference)).toEqual(['REF1'])
    })
  })

  describe('getPaymentRequest', () => {
    beforeEach(async () => {
      await db.paymentRequest().insert([
        { paymentRequestId: 1, schemeId: 1, frn: 1234567890, categoryId: ENRICHMENT, value: 123456, netValue: 100000, received: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { paymentRequestId: 2, schemeId: 2, frn: 1234567891, categoryId: ENRICHMENT, value: 5000 },
        { paymentRequestId: 3, schemeId: 2, frn: 1234567891, categoryId: ENRICHMENT, value: 5000 }
      ])
      await db.debtData().insert({ paymentRequestId: 3, schemeId: 2, frn: 1234567891, reference: 'REF', netValue: 5000 })
    })

    test('returns payment requests without debt data with scheme and text fields', async () => {
      const { rows, count } = await getPaymentRequest()

      expect(count).toBe(2)
      expect(rows.map(x => x.paymentRequestId)).toEqual([1, 2])
      expect(rows[0].schemes).toEqual({ name: 'SFI' })
      expect(rows[0].valueText).toBe('£1,234.56')
      expect(rows[0].netValueText).toBe('£1,000.00')
      expect(rows[0].daysWaiting).toBe(3)
      expect(rows[0].receivedFormatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
      expect(rows[1].daysWaiting).toBe('')
      expect(rows[1].receivedFormatted).toBe('')
    })

    test('filters by frn', async () => {
      const { rows, count } = await getPaymentRequest(1, 100, true, 1234567891)

      expect(count).toBe(1)
      expect(rows[0].paymentRequestId).toBe(2)
    })
  })

  describe('getQualityChecks', () => {
    beforeEach(async () => {
      await db.paymentRequest().insert([
        { paymentRequestId: 1, schemeId: 1, frn: 1234567890, categoryId: 2, value: 250000, marketingYear: 2023 },
        { paymentRequestId: 2, schemeId: 2, frn: 1234567891, categoryId: 2, value: 5000 },
        { paymentRequestId: 3, schemeId: 2, frn: 1234567892, categoryId: 3, value: 5000 }
      ])
      await db.qualityCheck().insert([
        { paymentRequestId: 1, status: PENDING },
        { paymentRequestId: 2, status: PENDING },
        { paymentRequestId: 3, status: PENDING }
      ])
      await db.manualLedgerPaymentRequest().insert([
        { paymentRequestId: 1, ledgerPaymentRequestId: 3, createdBy: 'User One', createdById: 'u1', active: true, original: true },
        { paymentRequestId: 1, ledgerPaymentRequestId: 3, createdBy: 'Old', createdById: 'u0', active: false, original: true }
      ])
    })

    test('returns pending checks that have an active manual ledger, each with a single row per check', async () => {
      const { rows, count } = await getQualityChecks()

      expect(count).toBe(1)
      expect(rows).toHaveLength(1)
      expect(rows[0].status).toBe(PENDING)
      expect(rows[0].paymentRequest).toMatchObject({
        paymentRequestId: 1,
        marketingYear: 2023,
        valueText: '£2,500.00',
        schemes: { name: 'SFI' },
        manualLedgerChecks: [{ createdBy: 'User One', createdById: 'u1' }]
      })
    })
  })

  describe('getQualityCheckedPaymentRequests', () => {
    test('returns passed checks with invoice lines, text fields and the provisional ledgers', async () => {
      await db.paymentRequest().insert([
        { paymentRequestId: 1, schemeId: 1, frn: 1234567890, categoryId: 2, value: 250000 },
        { paymentRequestId: 2, schemeId: 1, frn: 1234567890, categoryId: 3, value: 250000 }
      ])
      await db.invoiceLine().insert([
        { paymentRequestId: 1, description: 'G00', value: 250000 },
        { paymentRequestId: 2, description: 'G00', value: 250000 }
      ])
      await db.qualityCheck().insert({ paymentRequestId: 1, status: PASSED })
      await db.manualLedgerPaymentRequest().insert({ paymentRequestId: 1, ledgerPaymentRequestId: 2, active: true, original: true })

      const [result] = await getQualityCheckedPaymentRequests()

      expect(result.paymentRequest.valueText).toBe('£2,500.00')
      expect(result.paymentRequest.invoiceLines).toHaveLength(1)
      expect(result.paymentRequest.invoiceLines[0].valueText).toBe('£2,500.00')
      expect(result.paymentRequests).toHaveLength(1)
      expect(result.paymentRequests[0].paymentRequestId).toBe(2)
      expect(result.paymentRequests[0].schemes).toEqual({ schemeId: 1, name: 'SFI' })
    })
  })

  describe('getInvoiceLinesOfPaymentRequest', () => {
    test('returns the invoice lines with their payment request and scheme name', async () => {
      await db.paymentRequest().insert({ paymentRequestId: 1, schemeId: 1, frn: 1234567890, agreementNumber: 'AG1', invoiceNumber: 'INV1', paymentRequestNumber: 2, value: 5000 })
      await db.invoiceLine().insert({ paymentRequestId: 1, schemeCode: '80001', accountCode: 'SOS273', fundCode: 'DRD10', description: 'G00', value: 5000 })

      const [line] = await getInvoiceLinesOfPaymentRequest(1)

      expect(line).toMatchObject({ schemeCode: '80001', accountCode: 'SOS273', fundCode: 'DRD10', description: 'G00', value: 5000 })
      expect(line.paymentRequest).toEqual({
        frn: '1234567890',
        agreementNumber: 'AG1',
        invoiceNumber: 'INV1',
        paymentRequestNumber: 2,
        value: 5000,
        schemes: { name: 'SFI' }
      })
    })
  })
})
