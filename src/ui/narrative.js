import { THEMES, CITIES, citiesOfTheme, THEME_BY_ID } from '../data/cities.js'

const THEME_SVG = {
  memory: `<circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="42" y="42" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/><rect x="50" y="50" width="20" height="20" fill="currentColor" opacity=".15"/><line x1="60" y1="20" x2="60" y2="40" stroke="currentColor" stroke-width="1"/><line x1="60" y1="80" x2="60" y2="100" stroke="currentColor" stroke-width="1"/>`,
  desire: `<path d="M60 22 C88 22 98 48 98 60 C98 88 72 98 60 98 C32 98 22 72 22 60 C22 36 44 28 60 28 C78 28 90 44 90 60 C90 76 76 86 60 86" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="60" cy="60" r="4" fill="currentColor"/>`,
  signs: `<rect x="28" y="28" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.2"/><line x1="28" y1="48" x2="92" y2="48" stroke="currentColor" stroke-width="1" opacity=".5"/><line x1="28" y1="72" x2="92" y2="72" stroke="currentColor" stroke-width="1" opacity=".5"/><line x1="48" y1="28" x2="48" y2="92" stroke="currentColor" stroke-width="1" opacity=".5"/><circle cx="60" cy="60" r="10" fill="currentColor" opacity=".2"/>`,
  thin: `<line x1="30" y1="95" x2="45" y2="25" stroke="currentColor" stroke-width="1.1"/><line x1="90" y1="95" x2="75" y2="25" stroke="currentColor" stroke-width="1.1"/><ellipse cx="60" cy="30" rx="22" ry="5" fill="none" stroke="currentColor" stroke-width="1"/><ellipse cx="60" cy="55" rx="28" ry="6" fill="none" stroke="currentColor" stroke-width="1"/><ellipse cx="60" cy="80" rx="18" ry="4" fill="none" stroke="currentColor" stroke-width="1"/>`,
  trade: `<line x1="25" y1="70" x2="95" y2="70" stroke="currentColor" stroke-width="1.2"/><path d="M35 70 Q60 30 85 70" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="35" cy="70" r="5" fill="currentColor" opacity=".3"/><circle cx="85" cy="70" r="5" fill="currentColor" opacity=".3"/><circle cx="60" cy="48" r="4" fill="currentColor"/>`,
  eyes: `<circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="60" cy="60" r="16" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="60" cy="60" r="5" fill="currentColor"/><line x1="60" y1="22" x2="60" y2="30" stroke="currentColor" stroke-width="1"/><line x1="60" y1="90" x2="60" y2="98" stroke="currentColor" stroke-width="1"/><line x1="22" y1="60" x2="30" y2="60" stroke="currentColor" stroke-width="1"/><line x1="90" y1="60" x2="98" y2="60" stroke="currentColor" stroke-width="1"/>`,
  names: `<rect x="40" y="22" width="10" height="76" fill="currentColor" opacity=".25"/><rect x="55" y="32" width="10" height="56" fill="currentColor" opacity=".18"/><rect x="70" y="42" width="10" height="36" fill="currentColor" opacity=".35"/><line x1="30" y1="28" x2="90" y2="28" stroke="currentColor" stroke-width="1"/><line x1="30" y1="92" x2="90" y2="92" stroke="currentColor" stroke-width="1"/>`,
  dead: `<polygon points="60,22 92,88 28,88" fill="none" stroke="currentColor" stroke-width="1.2"/><polygon points="60,42 78,78 42,78" fill="currentColor" opacity=".15"/><line x1="60" y1="22" x2="60" y2="88" stroke="currentColor" stroke-width="1" opacity=".4"/><circle cx="60" cy="70" r="4" fill="currentColor"/>`,
  sky: `<circle cx="60" cy="70" r="22" fill="none" stroke="currentColor" stroke-width="1.1"/><circle cx="60" cy="55" r="16" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="60" cy="42" r="10" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="60" cy="32" r="4" fill="currentColor"/><line x1="60" y1="18" x2="60" y2="28" stroke="currentColor" stroke-width="1"/>`,
  continuous: `<rect x="22" y="40" width="18" height="40" fill="currentColor" opacity=".12"/><rect x="44" y="32" width="18" height="48" fill="currentColor" opacity=".22"/><rect x="66" y="28" width="18" height="52" fill="currentColor" opacity=".12"/><line x1="22" y1="55" x2="84" y2="55" stroke="currentColor" stroke-width="1"/><line x1="22" y1="70" x2="84" y2="70" stroke="currentColor" stroke-width="1"/><circle cx="90" cy="55" r="3" fill="currentColor"/>`,
  hidden: `<rect x="30" y="30" width="60" height="60" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="42" y="42" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1"/><rect x="52" y="52" width="16" height="16" fill="currentColor" opacity=".2"/><line x1="30" y1="30" x2="42" y2="42" stroke="currentColor" stroke-width="1" opacity=".4"/>`,
}

/**
 * 生成主题章节 DOM + 星图总览 + 导航
 */

function el(tag, className, html) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (html != null) node.innerHTML = html
  return node
}

export function buildThemeSections(root, onCityClick) {
  THEMES.forEach((theme, ti) => {
    const section = el('section', 'section theme-block')
    section.dataset.section = `theme-${theme.id}`
    section.dataset.theme = theme.id

    const wrap = el('div', 'theme-section')
    wrap.style.setProperty('--theme-color', theme.color)

    // ── 文案侧 ──
    const copy = el('div', 'theme-copy')

    const idx = el('div', 'theme-index reveal', `主题 ${String(ti + 1).padStart(2, '0')} / 11`)
    copy.appendChild(idx)

    const name = el('h2', 'theme-name reveal reveal-delay-1', theme.name)
    copy.appendChild(name)

    const latin = el('div', 'theme-latin reveal reveal-delay-1', theme.latin)
    copy.appendChild(latin)

    const epi = el('p', 'theme-epigraph reveal reveal-delay-2', `「${theme.epigraph}」`)
    copy.appendChild(epi)

    const blurb = el('p', 'theme-blurb reveal reveal-delay-2', theme.blurb)
    copy.appendChild(blurb)

    const list = el('div', 'theme-cities reveal reveal-delay-3')
    citiesOfTheme(theme.id).forEach((city, ci) => {
      const row = el('button', 'theme-city-row')
      row.type = 'button'
      row.dataset.cityId = city.id
      row.innerHTML = `
        <span class="theme-city-num">${String(ci + 1).padStart(2, '0')}</span>
        <span class="theme-city-zh">${city.zh}</span>
        <span class="theme-city-it">${city.it}</span>
      `
      row.addEventListener('click', () => onCityClick(city.id))
      row.addEventListener('mouseenter', () => {
        window.__invisibleCities?.cityNodes?.get(city.id)?.beacon?.scale?.setScalar(2.2)
      })
      row.addEventListener('mouseleave', () => {
        window.__invisibleCities?.cityNodes?.get(city.id)?.beacon?.scale?.setScalar(1)
      })
      list.appendChild(row)
    })
    copy.appendChild(list)

    // ── 视觉侧 ──
    const visual = el('div', 'theme-visual reveal reveal-delay-2')

    const cloud = el('div', 'theme-dot-cloud')
    const rng = (seed) => {
      let s = seed
      return () => {
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646
      }
    }
    const r = rng(theme.id.length * 97 + ti * 13 + 3)
    for (let i = 0; i < 18; i++) {
      const d = el('div', 'theme-dot')
      d.style.left = `${8 + r() * 84}%`
      d.style.top = `${8 + r() * 84}%`
      d.style.width = `${3 + r() * 5}px`
      d.style.height = d.style.width
      d.style.opacity = String(0.15 + r() * 0.35)
      d.style.animation = `spin-slow ${40 + r() * 50}s linear infinite`
      cloud.appendChild(d)
    }
    visual.appendChild(cloud)

    const emblem = el('div', 'theme-emblem')
    emblem.appendChild(el('div', 'theme-emblem-ring'))
    emblem.appendChild(el('div', 'theme-emblem-ring theme-emblem-ring-2'))
    const svgWrap = el('div', 'theme-emblem-svg')
    svgWrap.innerHTML = `<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true"><g color="${theme.color}">${THEME_SVG[theme.id] || ''}</g></svg>`
    emblem.appendChild(svgWrap)
    emblem.appendChild(el('div', 'theme-emblem-label', theme.emblem))
    visual.appendChild(emblem)

    visual.appendChild(
      el(
        'div',
        'theme-visual-caption',
        `${theme.latin.toUpperCase()} · 05 CITIES`
      )
    )

    wrap.appendChild(copy)
    wrap.appendChild(visual)
    section.appendChild(wrap)
    root.appendChild(section)
  })
}

export function buildAtlas(gridEl, onCityClick) {
  CITIES.forEach((city, i) => {
    const theme = THEME_BY_ID[city.theme]
    const cell = el('button', 'atlas-cell reveal')
    cell.type = 'button'
    cell.dataset.cityId = city.id
    cell.style.setProperty('--cell-color', theme.color)
    cell.style.transitionDelay = `${(i % 12) * 0.035}s`
    cell.innerHTML = `
      <div class="atlas-cell-top">
        <span class="atlas-cell-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="atlas-cell-dot"></span>
      </div>
      <div class="atlas-cell-body">
        <div class="atlas-cell-zh">${city.zh}</div>
        <div class="atlas-cell-it">${city.it}</div>
      </div>
      <div class="atlas-cell-theme">${theme.name}</div>
    `
    cell.addEventListener('click', () => onCityClick(city.id))
    gridEl.appendChild(cell)
  })
}

export function buildNav(navEl, onThemeJump) {
  THEMES.forEach((theme) => {
    const btn = el('button', '', theme.name.replace('城市与', '').replace('的城市', ''))
    btn.type = 'button'
    btn.title = theme.name
    btn.dataset.theme = theme.id
    btn.addEventListener('click', () => onThemeJump(theme.id))
    navEl.appendChild(btn)
  })
}

/**
 * 滚动进度 + 章节高亮
 */
export function createScrollTracker({ onProgress, onSection }) {
  const sections = () => [
    ...document.querySelectorAll('[data-section]'),
  ]

  function measure() {
    const scrollY = window.scrollY
    const docH = document.documentElement.scrollHeight - window.innerHeight
    const p = docH > 0 ? scrollY / docH : 0
    onProgress(p)

    const mid = scrollY + window.innerHeight * 0.4
    let current = 'hero'
    let label = '序'
    for (const sec of sections()) {
      const top = sec.offsetTop
      if (mid >= top) {
        current = sec.dataset.section
        if (current.startsWith('theme-')) {
          const t = THEME_BY_ID[current.replace('theme-', '')]
          label = t ? t.name.replace('城市与', '') : label
        } else if (current === 'frame') {
          label = '御前'
        } else if (current === 'atlas') {
          label = '图集'
        } else if (current === 'epilogue') {
          label = '跋'
        }
      }
    }
    onSection(current, label)
  }

  window.addEventListener('scroll', measure, { passive: true })
  measure()
  return { measure }
}

/**
 * IntersectionObserver 揭示
 */
export function observeReveals() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  )
  document.querySelectorAll('.reveal').forEach((n) => io.observe(n))
  return io
}
