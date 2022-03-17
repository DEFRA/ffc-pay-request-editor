const db = require('../data')

const getPaymentRequest = async () => {
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
      $debtData$: null
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
      'ledger'
    ]
  })
}

const getPaymentRequestByInvoiceNumber = async (invoiceNumber) => {
  return db.paymentRequest.findOne({
    where: {
      invoiceNumber
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

module.exports = {
  getPaymentRequest,
  getPaymentRequestByInvoiceNumber,
  getPaymentRequestAwaitingEnrichment
}
