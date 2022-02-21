function ViewModel (schemes, payload, error) {
  const errorMessages = {}

  if (error) {
    errorMessages.summary = error.details.map(x => {
      return {
        text: x.message,
        href: `#${x.context.key}`
      }
    })
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
        checked: payload?.scheme === x ?? ''
      }
    })
  }

  const frn = {
    label: {
      text: 'Firm Reference Number (FRN)',
      classes: 'govuk-label--s'
    },
    classes: 'govuk-input--width-10',
    id: 'frn',
    name: 'frn',
    value: payload?.frn ?? ''
  }

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
    value: payload?.applicationIdentifier ?? ''
  }

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
    value: payload?.net ?? ''
  }

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
        text: 'Irregular',
        value: 'irr',
        checked: payload?.debtType === 'irr' ?? ''
      },
      {
        text: 'Administrative',
        value: 'admin',
        checked: payload?.debtType === 'admin' ?? ''
      }
    ]
  }

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
        classes: 'govuk-input--width-2',
        name: 'day',
        value: payload?.['debt-discovered-day'] ?? ''
      },
      {
        classes: 'govuk-input--width-2',
        name: 'month',
        value: payload?.['debt-discovered-month'] ?? ''
      },
      {
        classes: 'govuk-input--width-4',
        name: 'year',
        value: payload?.['debt-discovered-year'] ?? ''
      }
    ]
  }

  this.model = {
    components: {
      scheme,
      payload,
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
