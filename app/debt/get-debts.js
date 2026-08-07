const db = require('../data')

// Display name -> underlying stored scheme name.
// (Scheme names are normalised for display below - 'SFI' is shown as 'SFI22'.)
const SCHEME_DISPLAY_TO_STORED = {
  SFI22: 'SFI'
}

const getDebts = async ({
  includeAttached = false,
  page = 1,
  pageSize = 2500,
  usePagination = true,
  frn,
  scheme
} = {}) => {
  const offset = (page - 1) * pageSize

  const where = includeAttached
    ? { reference: { [db.Sequelize.Op.notLike]: 'Manual enrichment' } }
    : { paymentRequestId: null, reference: { [db.Sequelize.Op.notLike]: 'Manual enrichment' } }

  if (frn) {
    where.frn = String(frn)
  }

  const schemeInclude = {
    model: db.scheme,
    as: 'schemes',
    attributes: ['name']
  }

  if (scheme) {
    // Translate a display name (e.g. 'SFI22') back to the stored name (e.g. 'SFI') if needed
    schemeInclude.where = { name: SCHEME_DISPLAY_TO_STORED[scheme] || scheme }
    schemeInclude.required = true
  }

  const options = {
    where,
    include: [schemeInclude],
    attributes: [
      'debtDataId',
      'frn',
      'reference',
      'netValue',
      'netValueText',
      'debtType',
      'debtTypeText',
      'recoveryDate',
      'createdBy',
      'attachedDate',
      'paymentRequestId',
      'createdDate'
    ],
    order: [['createdDate', 'DESC']]
  }

  if (usePagination) {
    options.limit = pageSize
    options.offset = offset
  }

  const result = await db.debtData.findAndCountAll(options)

  // Work with plain objects rather than mutating the Sequelize model instances in place,
  // so the returned rows can't unexpectedly affect anything else still holding a reference
  // to the underlying model (e.g. re-saving would silently persist the display-only rename).
  result.rows = result.rows.map(debt => {
    const plainDebt = debt.get({ plain: true })
    if (plainDebt.schemes?.name === 'SFI') {
      plainDebt.schemes.name = 'SFI22'
    }
    return plainDebt
  })

  return result
}

module.exports = getDebts
