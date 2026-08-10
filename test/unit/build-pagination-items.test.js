const buildPaginationItems = require('../../app/utils/build-pagination-items')

describe('buildPaginationItems', () => {
  test('returns all pages when totalPages is 4 or less', () => {
    const result = buildPaginationItems(2, 4, 25)

    expect(result).toHaveLength(4)
    expect(result[1]).toEqual({
      number: 2,
      href: '?page=2&perPage=25',
      current: true
    })
  })

  test('filters empty query parameters', () => {
    const result = buildPaginationItems(
      1,
      4,
      25,
      {
        frn: '123',
        empty: '',
        nullValue: null,
        undefinedValue: undefined
      }
    )

    expect(result[0].href)
      .toBe('?page=1&perPage=25&frn=123')
  })

  test('shows current page and next page when page is greater than 4', () => {
    const result = buildPaginationItems(6, 10, 25)

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ number: 5 }),
        expect.objectContaining({
          number: 6,
          current: true
        }),
        expect.objectContaining({ number: 7 })
      ])
    )
  })

  test('adds left and right ellipsis when in middle pages', () => {
    const result = buildPaginationItems(6, 10, 25)

    expect(
      result.filter(item => item.ellipsis)
    ).toHaveLength(2)
  })

  test('does not duplicate current page when on last page', () => {
    const result = buildPaginationItems(10, 10, 25)

    const currentPages = result.filter(
      item => item.current === true
    )

    expect(currentPages).toHaveLength(1)
    expect(currentPages[0].number).toBe(10)
  })

  test('marks last page as current', () => {
    const result = buildPaginationItems(10, 10, 25)

    const lastPage = result.find(
      item => item.number === 10
    )

    expect(lastPage.current).toBe(true)
  })
})
