import { CITY_BY_ID, THEME_BY_ID, CITIES } from '../data/cities'

/**
 * 城市详情浮层
 */
function mustEl<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id)
  if (!node) throw new Error(`missing #${id}`)
  return node as T
}

export function createOverlay(opts: {
  onSelect?: (id: string) => void
  onClose?: () => void
}): {
  open: (cityId: string) => void
  close: () => void
  readonly current: string | null
} {
  const { onSelect, onClose } = opts
  const root = mustEl('city-overlay')
  const backdrop = mustEl('overlay-backdrop')
  const closeBtn = mustEl('overlay-close')
  const themeEl = mustEl('overlay-theme')
  const titleEl = mustEl('overlay-title')
  const itEl = mustEl('overlay-it')
  const mottoEl = mustEl('overlay-motto')
  const noteEl = mustEl('overlay-note')
  const themeTag = mustEl('overlay-theme-tag')
  const chapterEl = mustEl('overlay-chapter')
  const nEl = mustEl('overlay-n')
  const prevBtn = mustEl('overlay-prev')
  const nextBtn = mustEl('overlay-next')

  let currentId: string | null = null

  function open(cityId: string): void {
    const city = CITY_BY_ID[cityId]
    if (!city) return
    currentId = cityId
    const theme = THEME_BY_ID[city.theme]

    themeEl.textContent = theme.name
    themeEl.style.color = theme.color
    titleEl.textContent = city.zh
    itEl.textContent = city.it
    mottoEl.textContent = `「${city.motto}」`
    noteEl.textContent = city.note
    themeTag.textContent = theme.motif
    themeTag.style.color = theme.color
    chapterEl.textContent = `第 ${city.chapter} 章`
    nEl.textContent = String(city.n).padStart(2, '0')

    root.classList.add('is-open')
    root.setAttribute('aria-hidden', 'false')
    onSelect?.(cityId)
  }

  function close(): void {
    root.classList.remove('is-open')
    root.setAttribute('aria-hidden', 'true')
    currentId = null
    onClose?.()
  }

  function step(dir: number): void {
    if (!currentId) return
    const idx = CITIES.findIndex((c) => c.id === currentId)
    const next = CITIES[(idx + dir + CITIES.length) % CITIES.length]
    open(next.id)
  }

  closeBtn.addEventListener('click', close)
  backdrop.addEventListener('click', close)
  prevBtn.addEventListener('click', () => step(-1))
  nextBtn.addEventListener('click', () => step(1))

  window.addEventListener('keydown', (e) => {
    if (!root.classList.contains('is-open')) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowLeft') step(-1)
    if (e.key === 'ArrowRight') step(1)
  })

  return { open, close, get current() { return currentId } }
}
