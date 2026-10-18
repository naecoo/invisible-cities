import type { City } from '../data/cities'
import { ROUTES, type Route } from '../data/routes'

function mustEl<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id)
  if (!node) throw new Error(`missing #${id}`)
  return node as T
}

export interface MapUI {
  showMapLabels: (show: boolean) => void
  setLabels: (labels: Array<{ id: string; zh: string; themeColor: string; x: number; y: number }>) => void
  updateLabelPositions: (
    positions: Array<{ id: string; x: number; y: number; visible: boolean }>
  ) => void
  openCity: (city: City, route: Route, index: number, total: number) => void
  closeCity: () => void
  bind: (handlers: {
    onClose: () => void
    onPrev: () => void
    onNext: () => void
    onRoute: (routeId: string) => void
  }) => void
  setRouteActive: (routeId: string) => void
  readonly isOpen: boolean
}

export function createMapUI(): MapUI {
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
  const labelLayer = mustEl('map-labels')

  let open = false

  // 填充路线 pills
  ROUTES.forEach((r) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.textContent = r.name
    btn.dataset.routeId = r.id
    routePills.appendChild(btn)
  })

  function setRouteActive(routeId: string): void {
    routePills.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('is-active', (b as HTMLElement).dataset.routeId === routeId)
    })
  }

  function showMapLabels(show: boolean): void {
    labelLayer.style.opacity = show ? '1' : '0'
    labelLayer.style.pointerEvents = show ? 'auto' : 'none'
    labelLayer.classList.toggle('is-hidden', !show)
  }

  function setLabels(
    labels: Array<{ id: string; zh: string; themeColor: string; x: number; y: number }>
  ): void {
    labelLayer.innerHTML = ''
    labels.forEach((l) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'map-label'
      btn.dataset.cityId = l.id
      btn.style.setProperty('--label-color', l.themeColor)
      btn.innerHTML = `<span class="map-label-dot"></span><span class="map-label-text">${l.zh}</span>`
      labelLayer.appendChild(btn)
    })
  }

  function updateLabelPositions(
    positions: Array<{ id: string; x: number; y: number; visible: boolean }>
  ): void {
    positions.forEach((p) => {
      const el = labelLayer.querySelector(`[data-city-id="${p.id}"]`) as HTMLElement | null
      if (!el) return
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
      el.style.opacity = p.visible ? '1' : '0'
      el.style.pointerEvents = p.visible ? 'auto' : 'none'
    })
  }

  function openCity(city: City, _route: Route, index: number, total: number): void {
    themeEl.textContent = city.theme // placeholder, filled below via THEME
    titleEl.textContent = city.zh
    itEl.textContent = city.it
    mottoEl.textContent = `「${city.motto}」`
    chapterEl.textContent = `第 ${city.chapter} 章`
    nEl.textContent = `${String(index + 1).padStart(2, '0')} / ${total}`
    root.classList.add('is-open')
    root.setAttribute('aria-hidden', 'false')
    document.body.classList.add('stage-open')
    showMapLabels(false)
    open = true
  }

  function closeCity(): void {
    root.classList.remove('is-open')
    root.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('stage-open')
    showMapLabels(true)
    open = false
  }

  function bind(handlers: {
    onClose: () => void
    onPrev: () => void
    onNext: () => void
    onRoute: (routeId: string) => void
  }): void {
    closeBtn.addEventListener('click', handlers.onClose)
    prevBtn.addEventListener('click', handlers.onPrev)
    nextBtn.addEventListener('click', handlers.onNext)
    routePills.addEventListener('click', (e) => {
      const t = e.target as HTMLElement
      const btn = t.closest('button[data-route-id]') as HTMLElement | null
      if (btn?.dataset.routeId) handlers.onRoute(btn.dataset.routeId)
    })
  }

  return {
    showMapLabels,
    setLabels,
    updateLabelPositions,
    openCity,
    closeCity,
    bind,
    setRouteActive,
    get isOpen() {
      return open
    },
  }
}
