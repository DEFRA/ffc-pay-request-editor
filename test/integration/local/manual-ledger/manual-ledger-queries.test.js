const db = require('../../../../app/database')
const { truncate } = require('../../../helpers/truncate')
const { getManualLedgerRequests, getManualLedger, getManualLedgerCount, saveCalculatedManualLedger, updateManualLedgerUser } = require('../../../../app/manual-ledger')
const { getQualityChecksCount } = require('../../../../app/quality-check')
const {
  getDebtPaymentRequests,
  getPaymentRequestCount,
  getPaymentRequestByRequestId,
  getPaymentRequestByInvoiceNumberAndRequestId
} = require('../../../../app/payment-request')
const getCorrelationId = require('../../../../app/payment-request/get-correlation-id')
const { getDebtData } = require('../../../../app/debt')
const { removeAgreementData } = require('../../../../app/retention')
const { ENRICHMENT, LEDGER_CHECK } = require('../../../../app/payment-request/categories')
const { AP, AR } = require('../../../../app/processing/ledger/ledgers')
const { NOT_READY, FAILED, PENDING } = require('../../../../app/quality-check/statuses')

const CORRELATION_ID = '4c9a1f2e-6a0b-4b39-9d3a-0c5d5b1d8f11'

describe('manual ledger queries', () => {
  beforeEach(async () => {
    await truncate()

    await db.scheme().insert({ schemeId: 1, name: 'SFI' })
    await db.paymentRequest().insert([
      { paymentRequestId: 1, schemeId: 1, frn: 1234567890, categoryId: 2, ledger: AP, value: 100000, netValue: 90000, agreementNumber: 'AG1', contractNumber: 'C1', invoiceNumber: 'INV1', correlationId: CORRELATION_ID, received: new Date('2023-04-10T00:00:00.000Z') },
      { paymentRequestId: 2, schemeId: 1, frn: 1234567890, categoryId: 3, ledger: AP, value: 60000, agreementNumber: 'AG1', invoiceNumber: 'INV1' },
      { paymentRequestId: 3, schemeId: 1, frn: 1234567890, categoryId: 3, ledger: AR, value: 40000, agreementNumber: 'AG1', invoiceNumber: 'INV1' }
    ])
    await db.client.raw('SELECT setval(pg_get_serial_sequence(\'"paymentRequests"\', \'paymentRequestId\'), 3)')
    await db.invoiceLine().insert([
      { paymentRequestId: 1, description: 'G00', value: 100000 },
      { paymentRequestId: 2, description: 'G00', value: 60000 },
      { paymentRequestId: 3, description: 'G00', value: 40000 }
    ])
    await db.manualLedgerPaymentRequest().insert([
      { paymentRequestId: 1, ledgerPaymentRequestId: 2, active: true, original: true },
      { paymentRequestId: 1, ledgerPaymentRequestId: 3, active: true, original: true }
    ])
    await db.qualityCheck().insert({ paymentRequestId: 1, status: NOT_READY })
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  test('getManualLedgerRequests returns each active ledger with its invoice lines, scheme and text fields', async () => {
    const requests = await getManualLedgerRequests(1)

    expect(requests).toHaveLength(2)
    expect(requests[0].ledgerPaymentRequestId).toBe(2)
    expect(requests[0].ledgerPaymentRequest.paymentRequestId).toBe(2)
    expect(requests[0].ledgerPaymentRequest.valueText).toBe('£600.00')
    expect(requests[0].ledgerPaymentRequest.schemes).toEqual({ schemeId: 1, name: 'SFI' })
    expect(requests[0].ledgerPaymentRequest.invoiceLines).toHaveLength(1)
    expect(requests[0].ledgerPaymentRequest.invoiceLines[0].valueText).toBe('£600.00')
    expect(requests[1].ledgerPaymentRequest.paymentRequestId).toBe(3)
  })

  test('getManualLedgerRequests ignores inactive ledgers', async () => {
    await db.manualLedgerPaymentRequest().where({ ledgerPaymentRequestId: 3 }).update({ active: false })

    const requests = await getManualLedgerRequests(1)

    expect(requests).toHaveLength(1)
  })

  test('getManualLedger returns the payment request with scheme, invoice lines, text fields and ledger checks', async () => {
    const manualLedger = await getManualLedger(1)

    expect(manualLedger.paymentRequestId).toBe(1)
    expect(manualLedger.schemes).toEqual({ name: 'SFI' })
    expect(manualLedger.valueText).toBe('£1,000.00')
    expect(manualLedger.netValueText).toBe('£900.00')
    expect(manualLedger.receivedFormatted).toBe('10/04/2023')
    expect(manualLedger.invoiceLines).toHaveLength(1)
    expect(manualLedger.invoiceLines[0].valueText).toBe('£1,000.00')
    expect(manualLedger.manualLedgerChecks).toHaveLength(2)
  })

  test('getManualLedger returns an empty object when there are no active ledger checks', async () => {
    await db.manualLedgerPaymentRequest().update({ active: false })

    expect(await getManualLedger(1)).toEqual({})
  })

  test('getManualLedger returns an empty object when the payment request does not exist', async () => {
    expect(await getManualLedger(999)).toEqual({})
  })

  test('getManualLedgerCount counts category 2 payment requests with a not ready or failed quality check', async () => {
    expect(await getManualLedgerCount()).toBe(1)

    await db.qualityCheck().update({ status: FAILED })
    expect(await getManualLedgerCount()).toBe(1)

    await db.qualityCheck().update({ status: PENDING })
    expect(await getManualLedgerCount()).toBe(0)
  })

  test('getQualityChecksCount counts pending quality checks of category 2 payment requests', async () => {
    expect(await getQualityChecksCount()).toBe(0)

    await db.qualityCheck().update({ status: PENDING })
    expect(await getQualityChecksCount()).toBe(1)
  })

  test('updateManualLedgerUser only updates active ledger checks', async () => {
    await db.manualLedgerPaymentRequest().where({ ledgerPaymentRequestId: 3 }).update({ active: false })

    await updateManualLedgerUser(1, { username: 'Developer', userId: 'user-1' })

    const rows = await db.manualLedgerPaymentRequest().orderBy('ledgerPaymentRequestId', 'asc')
    expect(rows[0]).toMatchObject({ createdBy: 'Developer', createdById: 'user-1' })
    expect(rows[1].createdBy).toBeNull()
  })

  test('saveCalculatedManualLedger reactivates matching ledgers and creates new ones', async () => {
    await saveCalculatedManualLedger({
      paymentRequestId: 1,
      provisionalLedgerData: [
        { ledgerPaymentRequest: { ledger: AP, value: 60000 } },
        { ledgerPaymentRequest: { ledger: AR, value: 25000, schemeId: 1, frn: 1234567890, invoiceNumber: 'INV1', invoiceLines: [{ description: 'G00', value: 25000 }] } }
      ]
    })

    const checks = await db.manualLedgerPaymentRequest().orderBy('manualLedgerPaymentRequestId', 'asc')
    expect(checks).toHaveLength(3)
    expect(checks[0]).toMatchObject({ ledgerPaymentRequestId: 2, active: true })
    expect(checks[1]).toMatchObject({ ledgerPaymentRequestId: 3, active: false })
    expect(checks[2]).toMatchObject({ active: true, original: false })

    const created = await db.paymentRequest().where({ paymentRequestId: checks[2].ledgerPaymentRequestId }).first()
    expect(created).toMatchObject({ categoryId: 3, ledger: AR, value: 25000 })
    const createdLines = await db.invoiceLine().where({ paymentRequestId: created.paymentRequestId })
    expect(createdLines).toHaveLength(1)
  })

  test('saveCalculatedManualLedger rolls back when a save fails', async () => {
    await expect(saveCalculatedManualLedger({
      paymentRequestId: 1,
      provisionalLedgerData: [
        { ledgerPaymentRequest: { ledger: AR, value: 25000, invoiceLines: [{ value: 'not a number' }] } }
      ]
    })).rejects.toThrow()

    const checks = await db.manualLedgerPaymentRequest()
    expect(checks.every(x => x.active)).toBe(true)
  })

  test('getCorrelationId returns the correlation id or undefined', async () => {
    expect(await getCorrelationId(1)).toBe(CORRELATION_ID)
    expect(await getCorrelationId(999)).toBeUndefined()
  })

  test('getPaymentRequestByRequestId returns the payment request or null', async () => {
    expect((await getPaymentRequestByRequestId(1)).invoiceNumber).toBe('INV1')
    expect(await getPaymentRequestByRequestId(999)).toBeNull()
  })

  test('getPaymentRequestByInvoiceNumberAndRequestId returns the payment request with its scheme name or null', async () => {
    const paymentRequest = await getPaymentRequestByInvoiceNumberAndRequestId('INV1', 1)

    expect(paymentRequest.paymentRequestId).toBe(1)
    expect(paymentRequest.schemes).toEqual({ name: 'SFI' })
    expect(await getPaymentRequestByInvoiceNumberAndRequestId('INV1', 999)).toBeNull()
  })

  test('getDebtData returns the debt for a payment request or null', async () => {
    await db.debtData().insert({ paymentRequestId: 1, schemeId: 1, frn: 1234567890, reference: 'AG1', netValue: 100 })

    expect((await getDebtData(1)).reference).toBe('AG1')
    expect(await getDebtData(2)).toBeNull()
  })

  test('getPaymentRequestCount counts enrichment payment requests without debt data', async () => {
    await db.paymentRequest().where({ paymentRequestId: 1 }).update({ categoryId: ENRICHMENT })
    await db.paymentRequest().where({ paymentRequestId: 2 }).update({ categoryId: ENRICHMENT })
    await db.debtData().insert({ paymentRequestId: 2, schemeId: 1, frn: 1234567890, reference: 'AG1', netValue: 100 })

    expect(await getPaymentRequestCount()).toBe(1)
    expect(await getPaymentRequestCount(LEDGER_CHECK)).toBe(0)
    expect(await getPaymentRequestCount([ENRICHMENT, LEDGER_CHECK])).toBe(1)
  })

  test('getDebtPaymentRequests returns unreleased enrichment payment requests that have a debt type and recovery date', async () => {
    await db.paymentRequest().where({ paymentRequestId: 1 }).update({ categoryId: ENRICHMENT })
    await db.paymentRequest().where({ paymentRequestId: 2 }).update({ categoryId: ENRICHMENT, released: new Date() })
    await db.debtData().insert([
      { paymentRequestId: 1, schemeId: 1, frn: 1234567890, reference: 'AG1', netValue: 100, debtType: 'irr', recoveryDate: '20/01/2023' },
      { paymentRequestId: 2, schemeId: 1, frn: 1234567890, reference: 'AG1', netValue: 100, debtType: 'irr', recoveryDate: '20/01/2023' },
      { paymentRequestId: 3, schemeId: 1, frn: 1234567890, reference: 'AG1', netValue: 100 }
    ])

    const result = await getDebtPaymentRequests()

    expect(result).toEqual([{
      paymentRequestId: 1,
      invoiceNumber: 'INV1',
      frn: '1234567890',
      debtType: 'irr',
      recoveryDate: '20/01/2023'
    }])
  })

  test('getDebtPaymentRequests returns nothing when no debt has a debt type and recovery date', async () => {
    expect(await getDebtPaymentRequests()).toEqual([])
  })

  test('removeAgreementData removes the payment requests and everything that references them in one transaction', async () => {
    await db.debtData().insert({ paymentRequestId: 1, schemeId: 1, frn: 1234567890, reference: 'AG1', netValue: 100 })

    await removeAgreementData({ agreementNumber: 'AG1', frn: 1234567890, schemeId: 1, usesContractNumber: false })

    for (const table of [db.paymentRequest, db.invoiceLine, db.manualLedgerPaymentRequest, db.qualityCheck, db.debtData]) {
      expect(await table()).toHaveLength(0)
    }
  })

  test('removeAgreementData finds payment requests by contract number when required', async () => {
    await removeAgreementData({ agreementNumber: 'C1', frn: 1234567890, schemeId: 1, usesContractNumber: true })

    expect(await db.paymentRequest().where({ paymentRequestId: 1 })).toHaveLength(0)
    expect(await db.paymentRequest().where({ paymentRequestId: 2 })).toHaveLength(1)
  })

  test('removeAgreementData does nothing when no payment requests match', async () => {
    await removeAgreementData({ agreementNumber: 'UNKNOWN', frn: 1234567890, schemeId: 1, usesContractNumber: false })

    expect(await db.paymentRequest()).toHaveLength(3)
  })
})
