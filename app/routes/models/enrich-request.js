const { getObjectKeyEquals } = require('../../processing/object-check')

const {
  ADMINISTRATIVE,
  IRREGULAR
} = require('../../debt-types')

function ViewModel (payload, error) {
  const errorMessage = { }
  if (error) {
    for (const detail of error.details) {
      detail.text = detail.message
      errorMessage[detail.context.label] = 'govuk-input--error'
      if (detail.context.label === 'day' ||
        detail.context.label === 'month' ||
        detail.context.label === 'year') {
        detail.href = `#debt-discovered-date-${detail.context.label}`
        errorMessage['date-error'] = {
          text: 'The date submitted is not valid'
        }
      } else if (detail.context.label === 'date') {
        const text = 'Recovery date must be today or in the past'
        detail.href = '#debt-discovered-date-day'
        detail.text = text
        errorMessage['date-error'] = {
          text
        }
      } else {
        const text = 'Select the type of debt'
        detail.href = `#${detail.context.label}`
        detail.text = text
        errorMessage['radio-error'] = {
          text
        }
      }
    }

    errorMessage.summary = {
      titleText: 'There is a problem',
      errorList: error.details
    }
  }

  this.model = {
    errorMessage: errorMessage.summary,
    radio: {
      id: 'debt-type',
      name: 'debt-type',
      classes: 'govuk-radios--small',
      fieldset: {
        legend: {
          text: 'Type of debt',
          classes: 'govuk-label govuk-label--s'
        }
      },
      items: [
        {
          text: 'Irregular',
          value: IRREGULAR,
          checked: getObjectKeyEquals(payload, 'debtType', IRREGULAR)
        },
        {
          text: 'Administrative',
          value: ADMINISTRATIVE,
          checked: getObjectKeyEquals(payload, 'debtType', ADMINISTRATIVE)
        }
      ],
      errorMessage: errorMessage['radio-error']
    },
    date: {
      id: 'debt-discovered-date',
      fieldset: {
        legend: {
          text: 'Debt date discovered',
          classes: 'govuk-fieldset__legend govuk-fieldset__legend--s'
        }
      },
      hint: {
        text: 'For example, 27 3 2007'
      },
      errorMessage: errorMessage['date-error'],
      items: [
        {
          classes: `govuk-input--width-2 ${errorMessage.day}`,
          name: 'day',
          value: payload ? payload.day : ''
        },
        {
          classes: `govuk-input--width-2 ${errorMessage.month}`,
          name: 'month',
          value: payload ? payload.month : ''
        },
        {
          classes: `govuk-input--width-4 ${errorMessage.year}`,
          name: 'year',
          value: payload ? payload.year : ''
        }
      ]
    }
  }
}

module.exports = ViewModel
