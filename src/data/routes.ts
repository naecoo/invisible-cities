import { CITIES, THEMES, citiesOfTheme, type City } from './cities'

export interface Route {
  id: string
  name: string
  latin: string
  description: string
  /** 有序的城市 id 列表 */
  cityIds: string[]
}

/** 1. 原书之旅 — 按卡尔维诺章节出场顺序 */
function bookOrderRoute(): Route {
  const sorted = [...CITIES].sort((a, b) => {
    if (a.chapter !== b.chapter) return a.chapter - b.chapter
    return a.n - b.n
  })
  return {
    id: 'book',
    name: '原书之旅',
    latin: 'Per il libro',
    description: '沿原著九章的出场顺序，从御前对话走到最后的回声。',
    cityIds: sorted.map((c) => c.id),
  }
}

/** 2. 主题之旅 — 按十一类分类 */
function themeRoute(): Route {
  const ids: string[] = []
  for (const t of THEMES) {
    for (const c of citiesOfTheme(t.id)) ids.push(c.id)
  }
  return {
    id: 'theme',
    name: '分类之旅',
    latin: 'Per le categorie',
    description: '十一类主题各成一站：记忆、欲望、符号、轻盈……直到隐蔽。',
    cityIds: ids,
  }
}

/** 3. 空间之旅 — 按「想象地理」排布：高→低，内→外 */
function spatialRoute(): Route {
  // 启发式「地理」轴：天空/轻盈偏高，死亡/隐蔽偏低，贸易/连绵居中外放
  const heightScore: Record<string, number> = {
    sky: 10,
    thin: 9,
    eyes: 7,
    names: 6,
    signs: 5,
    memory: 4,
    desire: 3,
    trade: 2,
    continuous: 1,
    hidden: 0,
    dead: -1,
  }
  const sorted = [...CITIES].sort((a, b) => {
    const sa = heightScore[a.theme] ?? 0
    const sb = heightScore[b.theme] ?? 0
    if (sa !== sb) return sb - sa
    return a.n - b.n
  })
  return {
    id: 'spatial',
    name: '空间之旅',
    latin: 'Nello spazio',
    description: '按想象地理自天穹沉入地下：从天空之城一路走到死亡与隐蔽。',
    cityIds: sorted.map((c) => c.id),
  }
}

/** 4. 环城之旅 — 轻盈→贸易→连绵→隐蔽，绕城一圈 */
function ringRoute(): Route {
  const seq = ['thin', 'trade', 'continuous', 'hidden', 'dead', 'sky', 'eyes', 'names', 'signs', 'desire', 'memory']
  const ids: string[] = []
  for (const id of seq) {
    for (const c of citiesOfTheme(id)) ids.push(c.id)
  }
  return {
    id: 'ring',
    name: '环城之旅',
    latin: 'In circolo',
    description: '从轻盈的细丝出发，经贸易与连绵，绕回记忆的起点。',
    cityIds: ids,
  }
}

export const ROUTES: Route[] = [
  bookOrderRoute(),
  themeRoute(),
  spatialRoute(),
  ringRoute(),
]

export function routeById(id: string): Route {
  return ROUTES.find((r) => r.id === id) ?? ROUTES[0]
}

export function cityIndexInRoute(route: Route, cityId: string): number {
  return route.cityIds.indexOf(cityId)
}

export function cityAt(route: Route, index: number): City | null {
  const id = route.cityIds[((index % route.cityIds.length) + route.cityIds.length) % route.cityIds.length]
  return CITIES.find((c) => c.id === id) ?? null
}
