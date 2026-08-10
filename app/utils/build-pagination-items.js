const buildPaginationItems = (
  page,
  totalPages,
  perPage,
  extraParams = {}
) => {
  const extraQuery = Object.entries(extraParams)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `&${key}=${encodeURIComponent(value)}`)
    .join('')

  const hrefFor = pageNumber =>
    `?page=${pageNumber}&perPage=${perPage}${extraQuery}`

  // Show all pages when there are only a few
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => {
      const pageNumber = index + 1

      return {
        number: pageNumber,
        href: hrefFor(pageNumber),
        current: pageNumber === page
      }
    })
  }

  let items = [
    {
      number: 1,
      href: hrefFor(1),
      current: page === 1
    }
  ]

  if (page <= 4) {
    items = items.concat(
      Array.from(
        { length: Math.min(page + 1, totalPages - 1) - 1 },
        (_, index) => {
          const pageNumber = index + 2

          return {
            number: pageNumber,
            href: hrefFor(pageNumber),
            current: pageNumber === page
          }
        }
      )
    )
  } else {
    items = items.concat([
      { ellipsis: true },
      {
        number: page - 1,
        href: hrefFor(page - 1)
      },
      ...(page !== totalPages
        ? [{
            number: page,
            href: hrefFor(page),
            current: true
          }]
        : [])
    ])
  }

  if (page > 4 && page < totalPages - 1) {
    items = items.concat([
      {
        number: page + 1,
        href: hrefFor(page + 1)
      }
    ])
  }

  if (page < totalPages - 2) {
    items = items.concat([{ ellipsis: true }])
  }

  items = items.concat([
    {
      number: totalPages,
      href: hrefFor(totalPages),
      current: page === totalPages
    }
  ])

  return items
}

module.exports = buildPaginationItems
