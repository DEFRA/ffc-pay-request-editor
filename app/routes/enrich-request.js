const db = require('../data')
const { getPaymentRequestByInvoiceNumber, updatePaymentRequestCategory } = require('../payment-request')
const { saveDebt } = require('../debt')
const { updateQualityChecksStatus } = require('../quality-check')
const format = require('../utils/date-formatter')
const ViewModel = require('./models/enrich-request')
const enrichRequestSchema = require('./schemas/enrich-request')
const dateSchema = require('./schemas/date')
const { enrichment } = require('../auth/permissions')
const { getUser } = require('../auth')
const { PENDING, PASSED, AWAITING_ENRICHMENT } = require('../quality-check/statuses')
const { sendEnrichRequestEvent } = require('../event')

module.exports = [{
  method: 'GET',
  path: '/enrich-request',
  options: {
    auth: { scope: [enrichment] },
    handler: async (request, h) => {
      const invoiceNumber = request.query.invoiceNumber
      if (!invoiceNumber) {
        return h.view('404')
      }

      const paymentRequest = await getPaymentRequestByInvoiceNumber(invoiceNumber)
      if (!paymentRequest) {
        console.log(`No records with invoiceNumber: ${invoiceNumber} are present in the database`)
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
      const paymentRequest = await getPaymentRequestByInvoiceNumber(invoiceNumber)

      const enrichRequestValidation = enrichRequestSchema.validate(payload, { abortEarly: false })
      if (enrichRequestValidation.error) {
        return h.view('enrich-request', { paymentRequest, ...new ViewModel(payload, enrichRequestValidation.error) }).code(400).takeover()
      }

      const day = format(payload.day)
      const month = format(payload.month)
      const year = payload.year

      const dateValidation = dateSchema.validate({
        date: `${year}-${month}-${day}`
      })

      if (dateValidation.error) {
        return h.view('enrich-request', { paymentRequest, ...new ViewModel(payload, dateValidation.error) }).code(400).takeover()
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

      const user = getUser(request)
      const { paymentRequestId, schemeId, frn } = paymentRequest
      await saveDebt({
        paymentRequestId: paymentRequestId,
        schemeId: schemeId,
        frn: frn,
        debtType: payload['debt-type'],
        recoveryDate: `${day}/${month}/${year}`,
        createdDate: new Date(),
        createdBy: user.username,
        createdById: user.userId
      })

      const isAwaitingManualLedgerDebtData = await db.qualityCheck.findOne({
        where: {
          paymentRequestId,
          status: AWAITING_ENRICHMENT
        }
      })

      if (isAwaitingManualLedgerDebtData) {
        await updatePaymentRequestCategory(paymentRequestId, 2)
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
