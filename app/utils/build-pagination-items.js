const buildPaginationItems = (
    page,
    totalPages,
    perPage,
    extraParams = {}
) => {
    const items = []

    const extraQuery = Object.entries(extraParams)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `&${key}=${encodeURIComponent(value)}`)
        .join('')

    const hrefFor = pageNumber =>
        `?page=${pageNumber}&perPage=${perPage}${extraQuery}`

    // Show all pages when there are only a few
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

    if (page <= 4) {
        // Show all pages up to one ahead of the current page
        for (let i = 2; i <= Math.min(page + 1, totalPages - 1); i++) {
            items.push({
                number: i,
                href: hrefFor(i),
                current: i === page
            })
        }
    } else {
        // Left ellipsis begins at page 5
        items.push({ ellipsis: true })

        // Previous page
        items.push({
            number: page - 1,
            href: hrefFor(page - 1)
        })

        // Current page
        if (page !== totalPages) {
            items.push({
                number: page,
                href: hrefFor(page),
                current: true
            })
        }
    }

    // Next page (if not near the end)
    if (
        page > 4 &&
        page < totalPages - 1
    ) {
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