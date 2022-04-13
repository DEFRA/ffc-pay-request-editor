const { getObjectKeyEquals } = require('../../processing/object-check')

const {
  ADMINISTRATIVE,
  ADMINISTRATIVE_TEXT,
  IRREGULAR,
  IRREGULAR_TEXT
} = require('../../debt-types')

const isLeapYear = (payload, errorMessage) => {
  if (payload?.day === '29' && payload?.month === '02') {
    const isLeap = new Date(payload?.year, 1, 29).getDate() === 29
    if (!isLeap) {
      errorMessage['date-error'] = { text: 'It is not currently a leap year.' }
    }
  }
}

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
        const text = 'Debt cannot be discovered in the future'
        detail.href = '#debt-discovered-date-day'
        detail.text = text
        errorMessage['date-error'] = {
          text
        }
      } else if (detail.context.label === 'date-not-leap-year') {
        const text = 'Debt date entered is not a leap year'
        detail.href = '#debt-discovered-date-day'
        detail.text = text
        errorMessage['date-error'] = {
          text
        }
      } else {
        const text = 'Select a type of debt'
        detail.href = `#${detail.context.label}`
        detail.text = text
        errorMessage['radio-error'] = {
          text
        }
      }
    }
  }

  isLeapYear(payload, errorMessage)

  if (Object.keys(errorMessage).length > 0) {
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
          text: 'Select a type of debt',
          classes: 'govuk-label govuk-label--s'
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
        text: 'For example, 27 3 2022. The debt must be from 2021 onwards'
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
