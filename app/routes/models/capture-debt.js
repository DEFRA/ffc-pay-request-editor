const {
  getObjectKey,
  getObjectKeyEquals
} = require('../../processing/object-check')

const {
  ADMINISTRATIVE,
  ADMINISTRATIVE_TEXT,
  IRREGULAR,
  IRREGULAR_TEXT
} = require('../../debt-types')

function ViewModel (schemes, payload, error) {
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

    errorMessages.debtDate = Object.entries(errorMessages).filter(x => x[0].startsWith('debt-discovered')).map(x => x[1]).join(' ')
  }

  const scheme = {
    classes: 'govuk-radios--small govuk-radios--inline',
    name: 'scheme',
    fieldset: {
      legend: {
        text: 'Scheme',
        classes: 'govuk-fieldset__legend--s'
      }
    },
    items: schemes.map(x => {
      return {
        text: x,
        value: x,
        checked: getObjectKeyEquals(payload, 'scheme', x)
      }
    })
  }

  scheme.errorMessage = errorMessages?.scheme ? { text: errorMessages.scheme } : ''

  const frn = {
    label: {
      text: 'Firm Reference Number (FRN)',
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
      text: 'Application identifier',
      classes: 'govuk-label--s'
    },
    hint: {
      text: 'Unique reference number to identify application.'
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
      text: 'Net value, in pounds',
      classes: 'govuk-label--s'
    },
    classes: 'govuk-input--width-5',
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
        text: 'Type of debt',
        classes: 'govuk-fieldset__legend--s'
      }
    },
    items: [
      {
        text: IRREGULAR_TEXT,
        value: IRREGULAR,
        checked: getObjectKeyEquals(payload, 'debtType', IRREGULAR)
      },
      {
        text: ADMINISTRATIVE_TEXT,
        value: ADMINISTRATIVE,
        checked: getObjectKeyEquals(payload, 'debtType', ADMINISTRATIVE)
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
      text: 'For example, 27 3 2017'
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

module.exports = ViewModel
