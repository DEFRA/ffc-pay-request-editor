const db = require('../data')
const { ENRICHMENT, LEDGER_ENRICHMENT } = require('./categories')
const { getPaymentRequestMatchingReference } = require('./get-payment-request-matching-reference')

const getPaymentRequest = async (categoryId = [ENRICHMENT, LEDGER_ENRICHMENT]) => {
  const paymentRequest = await db.paymentRequest.findAll({
    include: [{
      model: db.scheme,
      as: 'schemes',
      attributes: ['name']
    }, {
      model: db.debtData,
      as: 'debtData'
    }],
    where: {
      $debtData$: null,
      categoryId
    },
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
      'netValue'
    ],
    order: [['received']]
  })
  for (const payment of paymentRequest) {
    if (payment.schemes?.name === 'SFI') {
      payment.schemes.name = 'SFI22'
    }
  }
  return paymentRequest
}

const getPaymentRequestByInvoiceNumberAndRequestId = async (invoiceNumber, paymentRequestId) => {
  return db.paymentRequest.findOne({
    where: {
      invoiceNumber,
      paymentRequestId
    },
    raw: true
  })
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
