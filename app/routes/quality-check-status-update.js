
const { updateQualityChecksStatus } = require('../quality-check')

module.exports = [{
  method: 'GET',
  path: '/quality-check-status-update',
  options: {
    handler: async (request, h) => {
      return h.redirect('/quality-check')
    }
  }
},
{
  method: 'POST',
  path: '/quality-check-status-update',
  options: {
    handler: async (request, h) => {
      if (request.payload.status && request.payload.paymentrequestid) {
        await updateQualityChecksStatus(request.payload.paymentrequestid, request.payload.status)
        return h.redirect('/quality-check')
      }
      return h.redirect('/quality-check').code(301)
    }
  }
}

]
