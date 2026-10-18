import { CITY_BY_ID, THEME_BY_ID, CITIES } from '../data/cities.js'

/**
 * 城市详情浮层
 */
export function createOverlay({ onSelect, onClose }) {
  const root = document.getElementById('city-overlay')
  const backdrop = document.getElementById('overlay-backdrop')
  const closeBtn = document.getElementById('overlay-close')
  const themeEl = document.getElementById('overlay-theme')
  const titleEl = document.getElementById('overlay-title')
  const itEl = document.getElementById('overlay-it')
  const mottoEl = document.getElementById('overlay-motto')
  const noteEl = document.getElementById('overlay-note')
  const themeTag = document.getElementById('overlay-theme-tag')
  const chapterEl = document.getElementById('overlay-chapter')
  const nEl = document.getElementById('overlay-n')
  const prevBtn = document.getElementById('overlay-prev')
  const nextBtn = document.getElementById('overlay-next')

  let currentId = null

  function open(cityId) {
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

  function close() {
    root.classList.remove('is-open')
    root.setAttribute('aria-hidden', 'true')
    currentId = null
    onClose?.()
  }

  function step(dir) {
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
