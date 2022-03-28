let valueInPounds

const apValueId = 'ap-value'
const arValueId = 'ar-value'
const apPercentageId = 'ap-percentage'
const arPercentageId = 'ar-percentage'

const ledgerWrapper = document.getElementById('ledger-wrapper')
const ledgerError = document.getElementById('ledger-value-error')
const calculateAction = document.getElementById('calculate-ledger')

const apValue = document.getElementById(apValueId)
const apPercentage = document.getElementById(apPercentageId)
const arValue = document.getElementById(arValueId)
const arPercentage = document.getElementById(arPercentageId)

const calculatePercentage = (partialValue, totalValue) => {
  return (100 * partialValue) / totalValue
}

const calculatePercentValue = (percentValue, partialValue) => {
  return ((percentValue * partialValue) / 100).toFixed(2)
}

const raiseError = (component, action, classType) => {
  component.classList[action](classType)
}

const validateValues = () => {
  const valuesToCheck = [apValue, arValue, arPercentage, apPercentage]
  const inputErrorClass = 'govuk-input--error'
  const formErrorClass = 'govuk-form-group--error'

  const checkIfValueString = valuesToCheck.every(value => isNaN(value.value))

  if (checkIfValueString || apPercentageId.value > 100 || arPercentage.value > 100) {
    valuesToCheck.forEach(value => {
      raiseError(value, 'add', inputErrorClass)
    })
    raiseError(ledgerWrapper, 'add', formErrorClass)
    ledgerError.style.display = 'block'
    calculateAction.disabled = true
  } else {
    valuesToCheck.forEach(value => {
      raiseError(value, 'remove', inputErrorClass)
    })
    raiseError(ledgerWrapper, 'remove', formErrorClass)
    ledgerError.style.display = 'none'
    calculateAction.disabled = false
  }
}

const setDefaultPercentage = () => {
  apPercentage.value = calculatePercentage(apValue.value, valueInPounds)
  arPercentage.value = calculatePercentage(arValue.value, valueInPounds)
  validateValues()
}

const setValue = (changedValue, valueToChange) => {
  const value = document.getElementById(changedValue).value
  const calculate = valueInPounds - value
  document.getElementById(valueToChange).value = calculate
  validateValues()
  setDefaultPercentage()
}

const setPercentage = (percentageChangeValue, valueToChange, percentageToCalculate, valueToCalculate) => {
  const value = document.getElementById(percentageChangeValue).value
  const percentValue = calculatePercentValue(value, valueInPounds)
  document.getElementById(valueToChange).value = percentValue
  const calculate = 100 - value
  document.getElementById(percentageToCalculate).value = calculate
  document.getElementById(valueToCalculate).value = calculatePercentValue(calculate, valueInPounds)
  validateValues()
}

arValue.addEventListener('input', (event) => {
  setValue(arValueId, apValueId)
})

apValue.addEventListener('input', (event) => {
  setValue(apValueId, arValueId)
})

arPercentage.addEventListener('input', (event) => {
  setPercentage(arPercentageId, arValueId, apPercentageId, apValueId)
})

apPercentage.addEventListener('input', (event) => {
  setPercentage(apPercentageId, apValueId, arPercentageId, arValueId)
})

export function init (value) {
  valueInPounds = value
  setDefaultPercentage()
}
