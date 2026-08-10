const db = require('../data')
const { ENRICHMENT, LEDGER_ENRICHMENT } = require('./categories')
const { getPaymentRequestMatchingReference } = require('./get-payment-request-matching-reference')

const getPaymentRequest = async (page = 1, pageSize = 100, usePagination = true, frn) => {
  const categoryId = [ENRICHMENT, LEDGER_ENRICHMENT]
  const offset = (page - 1) * pageSize
  const where = {
    $debtData$: null,
    categoryId
  }
  if (frn) {
    where.frn = String(frn)
  }
  const options = {
    include: [{
      model: db.scheme,
      as: 'schemes',
      attributes: ['name']
    }, {
      model: db.debtData,
      as: 'debtData'
    }],
    where,
    attributes: [
      'paymentRequestId',
      'frn',
      'agreementNumber',
      'invoiceNumber',
      'paymentRequestNumber',
      'value',
      'received',
      'receivedFormatted',
      'ledger',
      'marketingYear',
      'daysWaiting',
      'netValue',
      'fesCode',
      'annualValue',
      'remmittanceDescription'
    ],
    order: [['received']]
  }
  if (usePagination) {
    options.limit = pageSize
    options.offset = offset
  }
  const result = await db.paymentRequest.findAndCountAll(options)
  // Work with plain objects rather than mutating the Sequelize model instances in place,
  // so the returned rows can't unexpectedly affect anything else still holding a reference
  // to the underlying model (e.g. re-saving would silently persist the display-only rename).
  result.rows = result.rows.map(payment => {
    const plainPayment = payment.get({ plain: true })
    if (plainPayment.schemes?.name === 'SFI') {
      plainPayment.schemes.name = 'SFI22'
    }
    if (plainPayment.schemes?.name === 'Vet Visits') {
      plainPayment.schemes.name = 'Annual Health and Welfare Review'
    }
    return plainPayment
  })
  return result
}

const getPaymentRequestByInvoiceNumberAndRequestId = async (invoiceNumber, paymentRequestId) => {
  const paymentRequest = await db.paymentRequest.findOne({
    where: {
      invoiceNumber,
      paymentRequestId
    },
    include: [{
      model: db.scheme,
      as: 'schemes',
      attributes: ['name']
    }],
    raw: true,
    nest: true
  })
  if (paymentRequest?.schemes?.name === 'SFI') {
    paymentRequest.schemes.name = 'SFI22'
  }
  if (paymentRequest?.schemes?.name === 'Vet Visits') {
    paymentRequest.schemes.name = 'Annual Health and Welfare Review'
  }
  return paymentRequest
}

const getPaymentRequestAwaitingEnrichment = async (schemeId, frn, applicationIdentifier, netValue, categoryId = [ENRICHMENT, LEDGER_ENRICHMENT]) => {
  const reference = getPaymentRequestMatchingReference(schemeId, applicationIdentifier)
  return db.paymentRequest.findOne({
    include: [{
      model: db.debtData,
      as: 'debtData'
    }],
    where: {
      $debtData$: null,
      released: null,
      schemeId,
      frn,
      ...reference,
      [db.Sequelize.Op.or]: [
        { value: netValue },
        { netValue }
      ],
      categoryId
    },
    raw: true
  })
}

const getPaymentRequestByRequestId = async (paymentRequestId) => {
  return db.paymentRequest.findOne({
    where: {
      paymentRequestId
    },
    raw: true
  })
}

module.exports = {
  getPaymentRequest,
  getPaymentRequestByInvoiceNumberAndRequestId,
  getPaymentRequestAwaitingEnrichment,
  getPaymentRequestByRequestId
}
