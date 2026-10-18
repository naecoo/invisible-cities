import { CITY_BY_ID, THEME_BY_ID, CITIES } from '../data/cities'
import { ROUTES, routeById, cityIndexInRoute, type Route } from '../data/routes'

function mustEl<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id)
  if (!node) throw new Error(`missing #${id}`)
  return node as T
}

export interface StageCallbacks {
  onSelect: (cityId: string) => void
  onClose: () => void
  onRouteChange: (route: Route) => void
}

export function createStage(opts: StageCallbacks): {
  open: (cityId: string, routeId?: string) => void
  close: () => void
  readonly current: string | null
  readonly route: Route
} {
  const root = mustEl('city-overlay')
  const closeBtn = mustEl('overlay-close')
  const themeEl = mustEl('overlay-theme')
  const titleEl = mustEl('overlay-title')
  const itEl = mustEl('overlay-it')
  const mottoEl = mustEl('overlay-motto')
  const chapterEl = mustEl('overlay-chapter')
  const nEl = mustEl('overlay-n')
  const prevBtn = mustEl('overlay-prev')
  const nextBtn = mustEl('overlay-next')
  const routePills = mustEl('route-pills')

  let currentId: string | null = null
  let route: Route = ROUTES[0]

  ROUTES.forEach((r) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = r.name
    btn.dataset.routeId = r.id
    btn.addEventListener('click', () => {
      setRoute(r.id)
      renderPills()
    })
    routePills.appendChild(btn)
  })

  function renderPills(): void {
    routePills.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('is-active', (b as HTMLElement).dataset.routeId === route.id)
    })
  }

  function setRoute(routeId: string): void {
    route = routeById(routeId)
    renderPills()
    opts.onRouteChange(route)
  }

  function open(cityId: string, routeId?: string): void {
    const city = CITY_BY_ID[cityId]
    if (!city) return
    if (routeId) setRoute(routeId)
    currentId = cityId
    const theme = THEME_BY_ID[city.theme]

    themeEl.textContent = theme.name
    themeEl.style.color = theme.color
    titleEl.textContent = city.zh
    itEl.textContent = city.it
    mottoEl.textContent = `「${city.motto}」`
    chapterEl.textContent = `第 ${city.chapter} 章`
    const idx = cityIndexInRoute(route, cityId)
    const total = route.cityIds.length
    nEl.textContent = idx >= 0 ? `${String(idx + 1).padStart(2, '0')} / ${total}` : `— / ${total}`

    root.classList.add('is-open')
    root.setAttribute('aria-hidden', 'false')
    document.body.classList.add('stage-open')
    renderPills()
    opts.onSelect(cityId)
  }

  function close(): void {
    root.classList.remove('is-open')
    root.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('stage-open')
    currentId = null
    opts.onClose()
  }

  function step(dir: number): void {
    if (!currentId) return
    const ids = route.cityIds
    const idx = ids.indexOf(currentId)
    if (idx < 0) return
    const nextId = ids[(idx + dir + ids.length) % ids.length]
    open(nextId)
  }

  closeBtn.addEventListener('click', close)
  prevBtn.addEventListener('click', () => step(-1))
  nextBtn.addEventListener('click', () => step(1))

  window.addEventListener('keydown', (e) => {
    if (!root.classList.contains('is-open')) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowLeft') step(-1)
    if (e.key === 'ArrowRight') step(1)
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const i = ROUTES.findIndex((r) => r.id === route.id)
      const ni = (i + (e.key === 'ArrowDown' ? 1 : ROUTES.length - 1)) % ROUTES.length
      setRoute(ROUTES[ni].id)
      const first = route.cityIds[0]
      if (first) open(first)
      e.preventDefault()
    }
  })

  return {
    open,
    close,
    get current() {
      return currentId
    },
    get route() {
      return route
    },
  }
}

export const createOverlay = createStage

export function allCities(): typeof CITIES {
  return CITIES
}
