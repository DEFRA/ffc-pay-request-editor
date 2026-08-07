const buildPaginationItems = (page, totalPages, perPage, extraParams = {}) => {
    const items = []
    const extraQuery = Object.entries(extraParams)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `&${key}=${encodeURIComponent(value)}`)
        .join('')

    const hrefFor = pageNumber => `?page=${pageNumber}&perPage=${perPage}${extraQuery}`

    if (totalPages <= 4) {
        for (let i = 1; i <= totalPages; i++) {
            items.push({
                number: i,
                href: hrefFor(i),
                current: i === page
            })
        }

        return items
    }

    // First page
    items.push({
        number: 1,
        href: hrefFor(1),
        current: page === 1
    })

    // Left ellipsis
    if (page > 3) {
        items.push({ ellipsis: true })
    }

    // Previous page number
    if (page > 2) {
        items.push({
            number: page - 1,
            href: hrefFor(page - 1)
        })
    }

    // Current page (unless first/last)
    if (page !== 1 && page !== totalPages) {
        items.push({
            number: page,
            href: hrefFor(page),
            current: true
        })
    }

    // Next page number
    if (page < totalPages - 1) {
        items.push({
            number: page + 1,
            href: hrefFor(page + 1)
        })
    }

    // Right ellipsis
    if (page < totalPages - 2) {
        items.push({ ellipsis: true })
    }

    // Last page
    items.push({
        number: totalPages,
        href: hrefFor(totalPages),
        current: page === totalPages
    })

    return items
}

module.exports = buildPaginationItems