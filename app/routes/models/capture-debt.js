const {
  getObjectKey,
  getObjectKeyEquals
} = require('../../processing/object-check')

const {
  ADMINISTRATIVE,
  ADMINISTRATIVE_TEXT,
  IRREGULAR,
  IRREGULAR_TEXT
} = require('../../constants/debt-types')

function viewModel (schemes, payload, error) {
  const errorMessages = {}

  if (error) {
    for (const x of error.details) {
      errorMessages[x.context.key] = x.message
    }

    errorMessages.summary = error.details.map(x => {
      return {
        text: x.message,
        href: `#${x.context.key}`
      }
    })

    errorMessages.debtDate = Object.entries(errorMessages).filter(x => x[0].startsWith('debt-discovered') || x[0] === 'date').map(x => x[1]).join(' ')
  }

  const schemeItems = [{
    value: '',
    text: 'Select a scheme',
    selected: !getObjectKey(payload, 'scheme')
  }].concat(schemes.map(x => ({
    value: x,
    text: x,
    selected: getObjectKeyEquals(payload, 'scheme', x)
  })))

  const scheme = {
    classes: 'govuk-input--width-10',
    id: 'scheme',
    name: 'scheme',
    label: {
      text: 'Scheme',
      classes: 'govuk-label--s'
    },
    items: schemeItems
  }

  scheme.errorMessage = errorMessages?.scheme ? { text: errorMessages.scheme } : ''

  const frn = {
    label: {
      text: 'FRN (Firm Reference Number)',
      classes: 'govuk-label--s'
    },
    classes: 'govuk-input--width-10',
    id: 'frn',
    name: 'frn',
    value: getObjectKey(payload, 'frn')
  }

  frn.errorMessage = errorMessages?.frn ? { text: errorMessages.frn } : ''

  const applicationIdentifier = {
    label: {
      text: 'Agreement / claim number',
      classes: 'govuk-label--s'
    },
    hint: {
      text: 'For example, SIP000000000001 or 12345678'
    },
    classes: 'govuk-input--width-10',
    id: 'applicationIdentifier',
    name: 'applicationIdentifier',
    value: getObjectKey(payload, 'applicationIdentifier')
  }

  applicationIdentifier.errorMessage = errorMessages?.applicationIdentifier ? { text: errorMessages.applicationIdentifier } : ''

  const net = {
    prefix: {
      text: '£'
    },
    label: {
      text: 'Net value',
      classes: 'govuk-label--s'
    },
    classes: 'govuk-input--width-10',
    id: 'net',
    name: 'net',
    value: getObjectKey(payload, 'net')
  }

  net.errorMessage = errorMessages?.net ? { text: errorMessages.net } : ''

  const debtType = {
    classes: 'govuk-radios--small',
    name: 'debtType',
    fieldset: {
      legend: {
        text: 'Debt type',
        classes: 'govuk-fieldset__legend--s'
      }
    },
    items: [
      {
        text: ADMINISTRATIVE_TEXT,
        value: ADMINISTRATIVE,
        checked: getObjectKeyEquals(payload, 'debtType', ADMINISTRATIVE)
      },
      {
        text: IRREGULAR_TEXT,
        value: IRREGULAR,
        checked: getObjectKeyEquals(payload, 'debtType', IRREGULAR)
      }
    ]
  }

  debtType.errorMessage = errorMessages?.debtType ? { text: errorMessages.debtType } : ''

  const debtDate = {
    id: 'debt-discovered',
    namePrefix: 'debt-discovered',
    fieldset: {
      legend: {
        text: 'Date debt discovered',
        classes: 'govuk-fieldset__legend--s'
      }
    },
    hint: {
      text: 'For example, 27 11 2023'
    },
    items: [
      {
        classes: errorMessages?.['debt-discovered-day'] ? 'govuk-input--width-2 govuk-input--error' : 'govuk-input--width-2',
        name: 'day',
        value: getObjectKey(payload, 'debt-discovered-day')
      },
      {
        classes: errorMessages?.['debt-discovered-month'] ? 'govuk-input--width-2 govuk-input--error' : 'govuk-input--width-2',
        name: 'month',
        value: getObjectKey(payload, 'debt-discovered-month')
      },
      {
        classes: errorMessages?.['debt-discovered-year'] ? 'govuk-input--width-4 govuk-input--error' : 'govuk-input--width-4',
        name: 'year',
        value: getObjectKey(payload, 'debt-discovered-year')
      }
    ]
  }

  debtDate.errorMessage = errorMessages?.debtDate ? { text: errorMessages.debtDate } : ''

  this.model = {
    schemes,
    components: {
      scheme,
      frn,
      applicationIdentifier,
      net,
      debtType,
      debtDate
    },
    errorSummary: errorMessages.summary
  }
}

module.exports = viewModel
