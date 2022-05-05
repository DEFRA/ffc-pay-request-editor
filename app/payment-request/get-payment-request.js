const db = require('../data')
const { ENRICHMENT, LEDGER_ENRICHMENT } = require('./categories')

const getPaymentRequest = async (categoryId = [ENRICHMENT, LEDGER_ENRICHMENT]) => {
  return db.paymentRequest.findAll({
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
}

const getPaymentRequestByInvoiceNumberAndRequestId = async (invoiceNumber, paymentRequestId) => {
  return db.paymentRequest.findOne({
    where: {
      invoiceNumber,
      paymentRequestId
    }
  })
}

const getPaymentRequestAwaitingEnrichmentWithNetValue = async (schemeId, frn, agreementNumber, netValue, categoryId = [ENRICHMENT, LEDGER_ENRICHMENT]) => {
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
      agreementNumber,
      netValue,
      categoryId
    }
  })
}

const getPaymentRequestAwaitingEnrichmentWithValue = async (schemeId, frn, agreementNumber, value, categoryId = [ENRICHMENT, LEDGER_ENRICHMENT]) => {
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
      agreementNumber,
      value,
      categoryId
    }
  })
}

const getPaymentRequestByRequestId = async (paymentRequestId) => {
  return db.paymentRequest.findOne({
    where: {
      paymentRequestId
    }
  })
}

module.exports = {
  getPaymentRequest,
  getPaymentRequestByInvoiceNumberAndRequestId,
  getPaymentRequestAwaitingEnrichmentWithNetValue,
  getPaymentRequestAwaitingEnrichmentWithValue,
  getPaymentRequestByRequestId
}
