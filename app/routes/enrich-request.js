const { getPaymentRequestByInvoiceNumberAndRequestId, updatePaymentRequestCategory } = require('../payment-request')
const { saveDebt } = require('../debt')
const { updateQualityChecksStatus } = require('../quality-check')
const format = require('../utils/date-formatter')
const ViewModel = require('./models/enrich-request')
const enrichRequestSchema = require('./schemas/enrich-request')
const dateSchema = require('./schemas/date')
const { enrichment } = require('../auth/permissions')
const { getUser } = require('../auth')
const { PENDING, PASSED } = require('../quality-check/statuses')
const { LEDGER_CHECK, LEDGER_ENRICHMENT } = require('../payment-request/categories')
const { sendEnrichRequestEvent } = require('../event')
const { checkAwaitingManualLedgerDebtData } = require('../manual-ledger')
module.exports = [{
  method: 'GET',
  path: '/enrich-request',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const invoiceNumber = request.query.invoiceNumber
      const paymentRequestId = parseInt(request.query.paymentRequestId)

      if (!invoiceNumber || !paymentRequestId) {
        return h.view('404')
      }

      const paymentRequest = await getPaymentRequestByInvoiceNumberAndRequestId(invoiceNumber, paymentRequestId)
      if (!paymentRequest) {
        console.log(`No  records with invoiceNumber: ${invoiceNumber} are present in the database`)
        return h.view('404')
      }

      if (paymentRequest.released) {
        console.log(`Debt information has already been attached to record with invoiceNumber: ${invoiceNumber}`)
        return h.view('404')
      }

      return h.view('enrich-request', { paymentRequest, ...new ViewModel() })
    }
  }
},
{
  method: 'POST',
  path: '/enrich-request',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const payload = request.payload

      const invoiceNumber = payload['invoice-number']
      const paymentRequestId = parseInt(payload['payment-request-id'])

      const paymentRequest = await getPaymentRequestByInvoiceNumberAndRequestId(invoiceNumber, paymentRequestId)

      const enrichRequestValidation = enrichRequestSchema.validate(payload, { abortEarly: false })
      if (enrichRequestValidation.error) {
        return h.view('enrich-request', { paymentRequest, ...new ViewModel(payload, enrichRequestValidation.error) }).code(400).takeover()
      }

      const day = format(payload.day)
      const month = format(payload.month)
      const year = payload.year

      const validDate = dateSchema({
        date: `${year}-${month}-${day}`
      }, paymentRequest.received)

      if (validDate.error) {
        return h.view('enrich-request', { paymentRequest, ...new ViewModel(payload, validDate.error) }).code(400).takeover()
      }

      if (payload?.day === '29' && payload?.month === '02') {
        const isLeap = new Date(payload?.year, 1, 29).getDate() === 29
        if (!isLeap) {
          const leapError = {
            details: [{
              context: {
                label: 'date-not-leap-year'
              }
            }]
          }
          return h.view('enrich-request', { paymentRequest, ...new ViewModel(payload, leapError) }).code(400).takeover()
        }
      }

      if (paymentRequest.released) {
        console.log(`Debt information has already been attached to record with invoiceNumber: ${invoiceNumber}`)
        return h.redirect('/enrich')
      }

      if (paymentRequest.categoryId === LEDGER_ENRICHMENT) {
        await updatePaymentRequestCategory(paymentRequestId, LEDGER_CHECK)
        await updateQualityChecksStatus(paymentRequestId, PENDING)
      }

      const user = getUser(request)
      const { schemeId, frn } = paymentRequest
      await saveDebt({
        paymentRequestId: paymentRequestId,
        schemeId: schemeId,
        frn: frn,
        reference: paymentRequest.agreementNumber,
        netValue: paymentRequest.netValue ?? paymentRequest.value,
        debtType: payload['debt-type'],
        recoveryDate: `${day}/${month}/${year}`,
        createdDate: new Date(),
        createdBy: user.username,
        createdById: user.userId
      })

      const isAwaitingManualLedgerDebtData = await checkAwaitingManualLedgerDebtData(paymentRequestId)
      if (isAwaitingManualLedgerDebtData) {
        await updatePaymentRequestCategory(paymentRequestId, LEDGER_CHECK)
        await updateQualityChecksStatus(paymentRequestId, PASSED)
      } else {
        await updateQualityChecksStatus(paymentRequestId, PENDING)
        await sendEnrichRequestEvent(paymentRequest, user)
      }
      return h.redirect('/enrich')
    }
  }
}
]
