const db = require('../data')

const getInvoiceLinesOfPaymentRequest = async (paymentRequestId) => {
  return db.invoiceLine.findAll(
    {
      where: { paymentRequestId },
      include: [
        {
          model: db.paymentRequest,
          as: 'paymentRequest',
          include: [
            {
              model: db.scheme,
              as: 'schemes',
              attributes: ['name']
            }
          ],
          attributes: [
            'frn',
            'agreementNumber',
            'invoiceNumber',
            'paymentRequestNumber',
            'value'
          ]
        }
      ],
      attributes: [
        'invoiceLineId',
        'schemeCode',
        'accountCode',
        'fundCode',
        'description',
        'value'
      ]
    }
  )
}

module.exports = getInvoiceLinesOfPaymentRequest
