const { getPaymentRequestByInvoiceNumberAndRequestId } = require('../payment-request')
const ViewModel = require('./models/enrich-request')
const enrichRequestSchema = require('./schemas/enrich-request')
const { enrichment } = require('../auth/permissions')
const { getUser } = require('../auth')
const { enrichRequest } = require('../processing/enrich')
const { validateDate } = require('../processing/validate-date')
const statusCodes = require('../constants/status-codes')
const { DEBT_TYPES } = require('../constants/debt-types')

const view = 'enrich-request'

const processEnrichPayload = async (payload) => {
  const invoiceNumber = payload['invoice-number']
  const paymentRequestId = Number.parseInt(payload['payment-request-id'])

  const paymentRequest = await getPaymentRequestByInvoiceNumberAndRequestId(invoiceNumber, paymentRequestId)

  const validation = enrichRequestSchema.validate(payload, { abortEarly: false })
  if (validation.error) {
    return { validationError: validation.error, paymentRequest, payload }
  }

  const dateError = await validateDate(payload, paymentRequest.received)
  if (dateError) {
    return { dateError, paymentRequest, payload }
  }

  if (paymentRequest.released) {
    return { released: true, paymentRequest }
  }

  return { paymentRequest, payload }
}

const respondEnrichErrors = (h, result, payload) => {
  if (result.validationError) {
    return h.view(view, { paymentRequest: result.paymentRequest, ...new ViewModel(payload, result.validationError) })
      .code(statusCodes.BAD_REQUEST)
      .takeover()
  }
  if (result.dateError) {
    return h.view(view, { paymentRequest: result.paymentRequest, ...new ViewModel(payload, result.dateError) })
      .code(statusCodes.BAD_REQUEST)
      .takeover()
  }
  if (result.released) {
    console.log(`Debt information has already been attached to record with invoiceNumber: ${payload['invoice-number']}`)
    return h.redirect('/enrich')
  }
  return null
}

module.exports = [
  {
    method: 'GET',
    path: '/enrich-request',
    options: {
      auth: { scope: [enrichment] },
      handler: async (request, h) => {
        const invoiceNumber = request.query.invoiceNumber
        const paymentRequestId = Number.parseInt(request.query.paymentRequestId)

        if (!invoiceNumber || !paymentRequestId) {
          return h.view('404')
        }

        const paymentRequest = await getPaymentRequestByInvoiceNumberAndRequestId(invoiceNumber, paymentRequestId)
        if (!paymentRequest) {
          console.log(`No records with invoiceNumber: ${invoiceNumber} are present in the database`)
          return h.view('404')
        }

        if (paymentRequest.released) {
          console.log(`Debt information has already been attached to record with invoiceNumber: ${invoiceNumber}`)
          return h.view('404')
        }

        return h.view(view, { paymentRequest, ...new ViewModel() })
      }
    }
  },
  {
    method: 'POST',
    path: '/enrich-request-confirm',
    options: {
      auth: { scope: [enrichment] },
      handler: async (request, h) => {
        const payload = request.payload
        const selectedDebt = DEBT_TYPES.find(d => d.id === payload['debt-type'])
        const debtTypeText = selectedDebt ? selectedDebt.text : payload['debt-type']

        const result = await processEnrichPayload(payload)
        const errorResponse = respondEnrichErrors(h, result, payload)
        if (errorResponse) {
          return errorResponse
        }

        return h.view(view + '-confirm', {
          invoiceNumber: payload['invoice-number'],
          paymentRequestId: payload['payment-request-id'],
          debtType: payload['debt-type'],
          debtTypeText,
          debtDiscoveredDay: payload.day,
          debtDiscoveredMonth: payload.month,
          debtDiscoveredYear: payload.year
        })
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

        const result = await processEnrichPayload(payload)
        const errorResponse = respondEnrichErrors(h, result, payload)
        if (errorResponse) {
          return errorResponse
        }

        const user = getUser(request)
        await enrichRequest(user, payload, result.paymentRequest)

        return h.redirect('/enrich?debtAdded=true')
      }
    }
  }
]
