const errorMessage = 'Please select Yes or No to agree if the provisional values are correct.'

function ViewModel (manualLedgerData, error) {
  this.model = {
    manualLedgerData: buildManualLedger(manualLedgerData),
    ledgerAgreement: createLedgerAgreementComponent(error)
  }

  if (error) {
    this.model.errorMessage = [{ text: errorMessage, href: '#agree' }]
  }
}

const buildManualLedger = (manualLedgerData) => {
  manualLedgerData.arAutoValue = 0
  manualLedgerData.apAutoValue = 0
  const ledgerPaymentRequests = manualLedgerData.manualLedgerChecks

  for (const manualLedgerCheck of ledgerPaymentRequests) {
    manualLedgerData[`${manualLedgerCheck.ledgerPaymentRequest.ledger.toLowerCase()}AutoValue`] = manualLedgerCheck.ledgerPaymentRequest.value
  }

  return manualLedgerData
}

const createLedgerAgreementComponent = (error) => {
  const LedgerAgreementComponent = {
    classes: 'govuk-radios--small',
    id: 'agree',
    name: 'agree',
    fieldset: {
      legend: {
        text: 'Do you agree with the provisional values?',
        classes: 'govuk-fieldset__legend--s'
      }
    },
    items: [
      {
        text: 'Yes',
        value: 'true'
      },
      {
        text: 'No',
        value: 'false'
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
