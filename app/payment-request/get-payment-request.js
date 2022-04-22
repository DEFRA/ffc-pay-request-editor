const db = require('../data')
const { AR } = require('../processing/ledger/ledgers')

const getPaymentRequest = async (categoryId = 1) => {
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

const getArPaymentRequestByInvoiceNumber = async (invoiceNumber) => {
  return db.paymentRequest.findOne({
    where: {
      invoiceNumber,
      ledger: AR
    }
  })
}

const getPaymentRequestAwaitingEnrichment = async (schemeId, frn, agreementNumber, value) => {
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
      value
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
  getArPaymentRequestByInvoiceNumber,
  getPaymentRequestAwaitingEnrichment,
  getPaymentRequestByRequestId
}
