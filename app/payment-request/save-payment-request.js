const { paymentRequest } = require('../database')
const TABLES = require('../constants/tables')
const { pickColumns } = require('../constants/columns')

const savePaymentRequest = async (request, transaction) => {
  const [saved] = await paymentRequest(transaction ?? undefined)
    .insert(pickColumns({ ...request, received: new Date() }, TABLES.paymentRequest))
    .returning('paymentRequestId')
  return saved
}

module.exports = savePaymentRequest
