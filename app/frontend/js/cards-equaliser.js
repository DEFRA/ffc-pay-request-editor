const selector = '.govuk-cards__item, .govuk-cards--2__item'
const debounceDelay = 120
let resizeTimer = null
const minApplyWidth = 768 // only equalise widths/heights at >= this viewport px

const resetSizes = (items) => {
  items.forEach(el => {
    el.style.height = ''
    el.style.flex = ''
    el.style.width = ''
  })
}

const equaliseHeightsAndWidths = () => {
  const items = Array.from(document.querySelectorAll(selector))
  if (!items.length) return

  // If viewport is narrower than the breakpoint, clear any inline sizing and exit
  if (!globalThis.matchMedia(`(min-width: ${minApplyWidth}px)`).matches) {
    resetSizes(items)
    return
  }

  resetSizes(items)

  const rects = items.map(el => el.getBoundingClientRect())
  const maxHeight = Math.max(...rects.map(r => Math.ceil(r.height)), 0)
  const maxWidth = Math.max(...rects.map(r => Math.ceil(r.width)), 0)

  if (maxHeight > 0) {
    items.forEach(el => { el.style.height = `${maxHeight}px` })
  }

  if (maxWidth > 0) {
    // Apply as flex-basis so we remain in the flex layout
    items.forEach(el => { el.style.flex = `0 0 ${maxWidth}px` })
  }
}

const debouncedEqualise = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(equaliseHeightsAndWidths, debounceDelay)
}

globalThis.addEventListener('load', equaliseHeightsAndWidths)
globalThis.addEventListener('resize', debouncedEqualise)

const observer = new MutationObserver(debouncedEqualise)
const container = document.querySelector('.govuk-cards') || document.body
observer.observe(container, { childList: true, subtree: true, characterData: true })

globalThis.cardsEqualiser = { equalise: equaliseHeightsAndWidths }
