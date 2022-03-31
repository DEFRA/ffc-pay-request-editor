const { FAILED, PASSED } = require('../../quality-check/statuses')

const errorMessage = 'Please select Yes or No to agree if the request has been edited correctly.'

function ViewModel (manualLedgerData, error) {
  this.model = {
    manualLedgerData,
    ledgerAgreement: createLedgerAgreementComponent(error)
  }

  if (error) {
    this.model.errorMessage = [{ text: errorMessage, href: '#status' }]
  }
}

const createLedgerAgreementComponent = (error) => {
  const LedgerAgreementComponent = {
    classes: 'govuk-radios--small',
    id: 'status',
    name: 'status',
    fieldset: {
      legend: {
        text: 'Has the request been edited correctly?',
        classes: 'govuk-fieldset__legend--s'
      }
    },
    hint: {
      text: 'Correctly edited requests will be immediately released from the editor.'
    },
    items: [
      {
        text: 'Yes',
        value: PASSED
      },
      {
        text: 'No',
        value: FAILED
      }
    ]
  }

  if (error) {
    LedgerAgreementComponent.errorMessage = {
      text: errorMessage
    }
  }

  return LedgerAgreementComponent
}

module.exports = ViewModel
