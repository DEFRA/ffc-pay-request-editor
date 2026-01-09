const SCHEME_ERROR = 'The scheme must be one of the following: SFI22, SFI Pilot, Lump Sums, Vet Visits, CS, BPS, SFI23, Delinked, Expanded SFI Offer, Combined Offer Higher Tier Revenue, Combined Offer Higher Tier Capital.'

const invalidSchemeTests = [
  { description: 'no scheme', field: () => ({ scheme: '' }), error: SCHEME_ERROR },
  { description: 'invalid scheme', field: () => ({ scheme: 'not-a-scheme' }), error: SCHEME_ERROR }
]

const invalidFrnTests = [
  { description: 'no FRN', field: () => ({ frn: '' }), error: 'The FRN must be a number.' },
  { description: '9-digit FRN', field: () => ({ frn: '123456789' }), error: 'The FRN must be 10 digits.' },
  { description: '11-digit FRN', field: () => ({ frn: '12345678910' }), error: 'The FRN must be 10 digits.' },
  { description: 'alphanumeric FRN', field: () => ({ frn: '123456789A' }), error: 'The FRN must be a number.' }
]

const invalidApplicationTests = [
  { description: 'no agreement number', field: () => ({ applicationIdentifier: '' }), error: 'The agreement/claim number is required.' },
  { description: 'short agreement number', field: () => ({ applicationIdentifier: '123' }), error: 'The agreement/claim number must be at least 5 characters long.' },
  { description: 'non-alphanumeric agreement number', field: () => ({ applicationIdentifier: '!23456789A12345' }), error: 'The agreement/claim number must be a string consisting of alphanumeric characters and underscores.' }
]

const invalidNetTests = [
  { description: 'no net', field: () => ({ net: '' }), error: 'The net value must be a number without commas.' },
  { description: 'negative net', field: () => ({ net: -100.20 }), error: 'The net value must be positive.' },
  { description: 'net >= 1 billion', field: () => ({ net: 1200000000 }), error: 'The net value must be less than £1,000,000,000.' },
  { description: 'net with commas', field: () => ({ net: '2,000.50' }), error: 'The net value must be a number without commas.' }
]

const invalidDebtTypeTests = [
  { description: 'no debt type', field: () => ({ debtType: '' }), error: 'The type of debt must be either administrative or irregular.' },
  { description: 'invalid debt type', field: () => ({ debtType: 'not-a-debt-type' }), error: 'The type of debt must be either administrative or irregular.' }
]

const invalidDateTests = [
  { description: 'no debt day', field: () => ({ 'debt-discovered-day': '' }), error: 'The debt day must be a number.' },
  { description: 'negative debt day', field: () => ({ 'debt-discovered-day': -4 }), error: 'The debt day cannot be less than 1.' },
  { description: 'debt day 0', field: () => ({ 'debt-discovered-day': 0 }), error: 'The debt day cannot be less than 1.' },
  { description: 'debt day > 31', field: () => ({ 'debt-discovered-day': 34 }), error: 'The debt day cannot be more than 31.' },
  { description: 'alphanumeric debt day', field: () => ({ 'debt-discovered-day': '2nd' }), error: 'The debt day must be a number.' },

  { description: 'no debt month', field: () => ({ 'debt-discovered-month': '' }), error: 'The debt month must be a number.' },
  { description: 'negative debt month', field: () => ({ 'debt-discovered-month': -4 }), error: 'The debt month cannot be less than 1.' },
  { description: 'debt month 0', field: () => ({ 'debt-discovered-month': 0 }), error: 'The debt month cannot be less than 1.' },
  { description: 'debt month > 12', field: () => ({ 'debt-discovered-month': 15 }), error: 'The debt month cannot be more than 12.' },
  { description: 'alphanumeric debt month', field: () => ({ 'debt-discovered-month': 'March' }), error: 'The debt month must be a number.' },

  { description: 'no debt year', field: () => ({ 'debt-discovered-year': '' }), error: 'The debt year must be a number.' },
  { description: 'negative debt year', field: () => ({ 'debt-discovered-year': -4 }), error: 'The debt year cannot be before 2015.' },
  { description: 'debt year 0', field: () => ({ 'debt-discovered-year': 0 }), error: 'The debt year cannot be before 2015.' },
  { description: 'debt year < 2015', field: () => ({ 'debt-discovered-year': 1878 }), error: 'The debt year cannot be before 2015.' },
  { description: 'debt year in future', field: () => ({ 'debt-discovered-year': 2108 }), error: 'The debt year cannot be in the future.' },
  { description: 'alphanumeric debt year', field: () => ({ 'debt-discovered-year': '2020!' }), error: 'The debt year must be a number.' },

  {
    description: 'date in future (tomorrow)',
    field: () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return {
        'debt-discovered-day': tomorrow.getDate(),
        'debt-discovered-month': tomorrow.getMonth() + 1,
        'debt-discovered-year': tomorrow.getFullYear()
      }
    },
    error: 'Date cannot be in the future.'
  },
  {
    description: 'invalid leap year date',
    field: () => ({
      'debt-discovered-day': 29,
      'debt-discovered-month': 2,
      'debt-discovered-year': 2022
    }),
    error: 'Date must be in the format YYYY-MM-DD.'
  },
  {
    description: 'invalid date (Sept 31)',
    field: () => ({
      'debt-discovered-day': 31,
      'debt-discovered-month': 9,
      'debt-discovered-year': 2022
    }),
    error: 'Date must be in the format YYYY-MM-DD.'
  }
]

module.exports = {
  invalidSchemeTests,
  invalidFrnTests,
  invalidApplicationTests,
  invalidNetTests,
  invalidDebtTypeTests,
  invalidDateTests
}
