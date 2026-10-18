import * as THREE from 'three'
import gsap from 'gsap'
import { THEMES, CITIES, CITY_BY_ID, THEME_BY_ID, citiesOfTheme } from './data/cities'
import { createWorld } from './scene/world'
import { createCitySculpture, setEdgeBudget } from './scene/cityGeometry'
import {
  buildThemeSections,
  buildAtlas,
  buildNav,
  createScrollTracker,
  observeReveals,
} from './ui/narrative'
import { createMapUI } from './ui/mapUI'
import { createCityModel } from './scene/cityModels'
import { ROUTES, routeById, cityIndexInRoute, type Route } from './data/routes'

/* ═══════════════════════════════════════════
   启动
   ═══════════════════════════════════════════ */

const canvas = document.getElementById('gl') as HTMLCanvasElement
const world = createWorld(canvas)
const { scene, camera } = world

// 光标 — 只写 transform，零布局
const cursorState = { x: 0, y: 0, tx: 0, ty: 0, dirty: false }
const mouse = { x: 0, y: 0 }
const scroll = { p: 0, section: 'hero', label: '序', smooth: 0 }

window.addEventListener(
  'mousemove',
  (e) => {
    cursorState.tx = e.clientX
    cursorState.ty = e.clientY
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1
    cursorState.dirty = true
  },
  { passive: true }
)

// 悬停态用 pointerover + 一次 closest（事件委托，避免每帧遍历）
document.addEventListener('pointerover', (e) => {
  const t = e.target
  if (!(t instanceof Element)) return
  document.body.classList.toggle(
    'is-hovering',
    !!(t.closest('button') || t.closest('a') || t.closest('.theme-city-row') || t.closest('.atlas-cell'))
  )
})

// 滚动状态
// (scroll / mouse 已在上方声明)

/* ═══════════════════════════════════════════
   城市星图布局 — 螺旋星系
   ═══════════════════════════════════════════ */

interface CityNode {
  group: THREE.Group
  update: (t: number) => void
  beacon: null
  beaconIndex: number
  worldPos: THREE.Vector3
  themeId: string
  index: number
}

const cityNodes = new Map<string, CityNode>()

function layoutCityPositions(): Map<string, { x: number; y: number; z: number; themeId: string }> {
  const positions = new Map()
  THEMES.forEach((theme, ti) => {
    const cities = citiesOfTheme(theme.id)
    // 主题在螺旋上的基点 — 更高的悬浮星系
    const baseAngle = ti * ((Math.PI * 2) / THEMES.length) - Math.PI * 0.35
    const baseR = 30 + ti * 3.2
    const baseY = 8 + ti * 2.1

    cities.forEach((city, ci) => {
      // 主题内小簇
      const innerAngle = baseAngle + (ci - 2) * 0.24
      const innerR = baseR + (ci - 2) * 3.8
      const y = baseY + (ci - 2) * 2.2 + Math.sin(ti + ci) * 1.6
      positions.set(city.id, {
        x: Math.cos(innerAngle) * innerR,
        y,
        z: Math.sin(innerAngle) * innerR * 0.72,
        themeId: theme.id,
      })
    })
  })
  return positions
}

function buildConstellation(): {
  sculptureRoot: THREE.Group
  updates: Array<(t: number) => void>
  beaconPoints: THREE.Points
  haloPoints: THREE.Points
} {
  const positions = layoutCityPositions()
  const sculptureRoot = new THREE.Group()
  scene.add(sculptureRoot)

  const updates: Array<(t: number) => void> = []

  // 信标统一为 Points（1 次 draw call 画 55 点）
  const beaconCount = CITIES.length
  const beaconPos = new Float32Array(beaconCount * 3)
  const beaconCol = new Float32Array(beaconCount * 3)

  CITIES.forEach((city, i) => {
    const pos = positions.get(city.id)!
    const theme = THEME_BY_ID[city.theme]

    // 每座城最多 2 条描边
    setEdgeBudget(2)
    // 雕塑 — 适度细节
    const { group, update } = createCitySculpture(city.theme, city.seed, 0.42 + (city.n % 3) * 0.03)
    group.position.set(pos.x, pos.y, pos.z)
    group.userData.cityId = city.id
    sculptureRoot.add(group)
    updates.push(update)

    // 信标坐标 / 主题色
    beaconPos[i * 3] = pos.x
    beaconPos[i * 3 + 1] = pos.y + 3.2
    beaconPos[i * 3 + 2] = pos.z
    const c = new THREE.Color(theme.color)
    beaconCol[i * 3] = c.r
    beaconCol[i * 3 + 1] = c.g
    beaconCol[i * 3 + 2] = c.b

    cityNodes.set(city.id, {
      group,
      update,
      beacon: null,
      beaconIndex: i,
      worldPos: new THREE.Vector3(pos.x, pos.y + 2, pos.z),
      themeId: city.theme,
      index: i,
    })
  })

  const beaconGeo = new THREE.BufferGeometry()
  beaconGeo.setAttribute('position', new THREE.BufferAttribute(beaconPos, 3))
  beaconGeo.setAttribute('color', new THREE.BufferAttribute(beaconCol, 3))
  const beaconPoints = new THREE.Points(
    beaconGeo,
    new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      sizeAttenuation: true,
    })
  )
  sculptureRoot.add(beaconPoints)

  // 光晕点（更大更淡）
  const haloGeo = new THREE.BufferGeometry()
  haloGeo.setAttribute('position', new THREE.BufferAttribute(beaconPos, 3))
  haloGeo.setAttribute('color', new THREE.BufferAttribute(beaconCol, 3))
  const haloPoints = new THREE.Points(
    haloGeo,
    new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      sizeAttenuation: true,
    })
  )
  sculptureRoot.add(haloPoints)

  // 同主题金色连线
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xc4a574,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  })
  THEMES.forEach((theme) => {
    const cities = citiesOfTheme(theme.id)
    const pts = cities.map((c) => cityNodes.get(c.id)!.worldPos.clone())
    for (let i = 0; i < pts.length - 1; i++) {
      const geo = new THREE.BufferGeometry().setFromPoints([pts[i], pts[i + 1]])
      sculptureRoot.add(new THREE.Line(geo, lineMat))
    }
    // 闭合环
    if (pts.length > 2) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        pts[pts.length - 1],
        pts[0],
      ])
      sculptureRoot.add(new THREE.Line(geo, lineMat))
    }
  })

  // 主题之间的淡金丝
  const interMat = new THREE.LineBasicMaterial({
    color: 0xb8a888,
    transparent: true,
    opacity: 0.07,
    depthWrite: false,
  })
  for (let ti = 0; ti < THEMES.length - 1; ti++) {
    const a = cityNodes.get(citiesOfTheme(THEMES[ti].id)[0].id)!.worldPos
    const b = cityNodes.get(citiesOfTheme(THEMES[ti + 1].id)[0].id)!.worldPos
    const geo = new THREE.BufferGeometry().setFromPoints([a, b])
    sculptureRoot.add(new THREE.Line(geo, interMat))
  }

  return { sculptureRoot, updates, beaconPoints, haloPoints }
}

const constellation = buildConstellation()
const beaconPoints = constellation.beaconPoints
const haloPoints = constellation.haloPoints

// ── Hero 主雕塑：十一种母题的合体之城 ──
function buildHeroCenterpiece() {
  const group = new THREE.Group()
  group.position.set(22, 10, -2)

  // 中央升塔
  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 1.8, 14, 7),
    new THREE.MeshStandardMaterial({
      color: 0xe8dcc8,
      transparent: true,
      opacity: 0.72,
      roughness: 0.85,
      metalness: 0.02,
      flatShading: true,
    })
  )
  spire.position.y = 6
  group.add(spire)
  group.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(spire.geometry, 20),
    new THREE.LineBasicMaterial({ color: 0x2a2420, transparent: true, opacity: 0.3 })
  ))

  // 螺旋平台
  for (let i = 0; i < 16; i++) {
    const t = i / 16
    const s = 5.2 - t * 3.4
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, 0.28, s * 0.75),
      new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? 0xc45c3e : 0xd8cfc0,
        transparent: true,
        opacity: 0.58,
        roughness: 0.88,
        flatShading: true,
      })
    )
    const a = t * Math.PI * 2.6
    const r = 1.2 + t * 3.2
    mesh.position.set(Math.cos(a) * r, i * 0.72, Math.sin(a) * r)
    mesh.rotation.y = a
    group.add(mesh)
    group.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 25),
      new THREE.LineBasicMaterial({ color: 0x2a2420, transparent: true, opacity: 0.22 })
    ))
  }

  // 悬浮环
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(6.5 + i * 1.8, 0.08, 8, 64),
      new THREE.MeshBasicMaterial({
        color: 0xc4a574,
        transparent: true,
        opacity: 0.35 - i * 0.08,
      })
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 4 + i * 2.8
    group.add(ring)
  }

  // 碎片立方
  for (let i = 0; i < 12; i++) {
    const s = 0.3 + Math.random() * 0.7
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, s, s),
      new THREE.MeshStandardMaterial({
        color: Math.random() > 0.6 ? 0xc45c3e : 0xb8c8d4,
        transparent: true,
        opacity: 0.5,
        roughness: 0.85,
        flatShading: true,
      })
    )
    const a = Math.random() * Math.PI * 2
    const r = 4 + Math.random() * 7
    mesh.position.set(
      Math.cos(a) * r,
      2 + Math.random() * 11,
      Math.sin(a) * r
    )
    mesh.rotation.set(Math.random(), Math.random() * Math.PI, Math.random())
    group.add(mesh)
  }

  // 顶部光核
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 1),
    new THREE.MeshStandardMaterial({
      color: 0xc45c3e,
      transparent: true,
      opacity: 0.65,
      roughness: 0.4,
      emissive: 0xc45c3e,
      emissiveIntensity: 0.15,
    })
  )
  core.position.y = 15.5
  group.add(core)

  scene.add(group)
  return group
}

const heroSculpture = buildHeroCenterpiece()

/* ═══════════════════════════════════════════
   相机 — 地图宏观 / 城市微观
   ═══════════════════════════════════════════ */

/** 地图总览相机 */
const MAP_CAM = {
  pos: new THREE.Vector3(0, 52, 58),
  look: new THREE.Vector3(0, 10, 0),
  fov: 42,
}

const camSmooth = {
  pos: MAP_CAM.pos.clone(),
  look: MAP_CAM.look.clone(),
  fov: MAP_CAM.fov,
}

type CamTarget = { pos: THREE.Vector3; look: THREE.Vector3; fov: number }

function flyCamera(to: CamTarget, duration = 1.4): void {
  // 由 tick 里 lerp；也可用 gsap 直接推 camSmooth
  gsap.to(camSmooth.pos, {
    x: to.pos.x,
    y: to.pos.y,
    z: to.pos.z,
    duration,
    ease: 'power2.inOut',
    overwrite: true,
  })
  gsap.to(camSmooth.look, {
    x: to.look.x,
    y: to.look.y,
    z: to.look.z,
    duration,
    ease: 'power2.inOut',
    overwrite: true,
  })
  gsap.to(camSmooth, {
    fov: to.fov,
    duration,
    ease: 'power2.inOut',
    overwrite: true,
  })
}

/* ── 模型拖拽环视 ── */
const orbit = {
  enabled: false,
  dragging: false,
  lastX: 0,
  lastY: 0,
  theta: 0,
  phi: 0.95,
  radius: 14,
  target: new THREE.Vector3(),
  velX: 0,
  velY: 0,
}

function orbitApply(): void {
  const { theta, phi, radius, target } = orbit
  camSmooth.pos.set(
    target.x + radius * Math.sin(phi) * Math.sin(theta),
    target.y + radius * Math.cos(phi),
    target.z + radius * Math.sin(phi) * Math.cos(theta)
  )
  camSmooth.look.copy(target)
}

function enableOrbit(center: THREE.Vector3, radius = 14): void {
  orbit.enabled = true
  orbit.target.copy(center)
  orbit.radius = radius
  // 根据当前相机位置反推角度，避免跳变
  const off = camSmooth.pos.clone().sub(center)
  orbit.radius = Math.max(10, off.length())
  orbit.theta = Math.atan2(off.x, off.z)
  orbit.phi = Math.acos(THREE.MathUtils.clamp(off.y / orbit.radius, -1, 1))
}

function disableOrbit(): void {
  orbit.enabled = false
  orbit.dragging = false
}

canvas.addEventListener('pointerdown', (e) => {
  if (!orbit.enabled) return
  gsap.killTweensOf(camSmooth.pos)
  gsap.killTweensOf(camSmooth.look)
  gsap.killTweensOf(camSmooth)
  orbit.dragging = true
  orbit.lastX = e.clientX
  orbit.lastY = e.clientY
  orbit.velX = 0
  orbit.velY = 0
  canvas.setPointerCapture(e.pointerId)
})

canvas.addEventListener('pointermove', (e) => {
  if (!orbit.enabled || !orbit.dragging) return
  const dx = e.clientX - orbit.lastX
  const dy = e.clientY - orbit.lastY
  orbit.lastX = e.clientX
  orbit.lastY = e.clientY
  orbit.theta -= dx * 0.006
  orbit.phi = THREE.MathUtils.clamp(orbit.phi + dy * 0.0035, 0.55, 1.25)
  orbit.velX = dx * 0.005
  orbit.velY = dy * 0.005
  orbitApply()
})

function endDrag(e?: PointerEvent): void {
  if (!orbit.dragging) return
  orbit.dragging = false
  if (e) {
    try {
      canvas.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }
}
canvas.addEventListener('pointerup', endDrag)
canvas.addEventListener('pointercancel', endDrag)
canvas.addEventListener('pointerleave', endDrag)

canvas.addEventListener(
  'wheel',
  (e) => {
    if (!orbit.enabled) return
    e.preventDefault()
    orbit.radius = THREE.MathUtils.clamp(orbit.radius + e.deltaY * 0.012, 8, 28)
    orbitApply()
  },
  { passive: false }
)

function orbitTick(): void {
  if (!orbit.enabled || orbit.dragging) return
  // 惯性
  if (Math.abs(orbit.velX) > 0.0002 || Math.abs(orbit.velY) > 0.0002) {
    orbit.theta -= orbit.velX
    orbit.phi = THREE.MathUtils.clamp(orbit.phi + orbit.velY, 0.55, 1.25)
    orbit.velX *= 0.92
    orbit.velY *= 0.92
    orbitApply()
  }
}


/* ═══════════════════════════════════════════
   DOM 构建
   ═══════════════════════════════════════════ */

function mustEl<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id)
  if (!node) throw new Error(`missing #${id}`)
  return node as T
}

const themeRoot = mustEl('theme-sections')
const atlasGrid = mustEl('atlas-grid')
const themeNav = mustEl('theme-nav')
const progressFill = mustEl('progress-fill')
const progressLabel = mustEl('progress-label')

// ── 舞台模型（前景唯一城市） ──
const stageRoot = new THREE.Group()
stageRoot.visible = false
scene.add(stageRoot)
let stageModel: THREE.Group | null = null



function mountStageModel(cityId: string): void {
  if (stageModel) {
    stageRoot.remove(stageModel)
    stageModel = null
  }
  const city = CITY_BY_ID[cityId]
  if (!city) return
  const inner = createCityModel(city.id, city.seed)
  // 外层容器负责放置到地图坐标，内层保留居中偏移
  const wrapper = new THREE.Group()
  const node = cityNodes.get(cityId)
  const at = node ? node.worldPos.clone() : new THREE.Vector3(0, 10, 0)
  wrapper.position.copy(at)
  wrapper.add(inner)
  stageRoot.add(wrapper)
  stageModel = wrapper
  stageRoot.visible = true
  // 隐藏星座小城 / 信标 / Hero，避免干扰
  if (heroSculpture) heroSculpture.visible = false
  if (beaconPoints) beaconPoints.visible = false
  if (haloPoints) haloPoints.visible = false
  cityNodes.forEach((n) => {
    n.group.visible = false
  })
  wrapper.scale.setScalar(0.01)
  gsap.to(wrapper.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'power3.out' })
}

function unmountStageModel(): void {
  stageRoot.visible = false
  if (stageModel) {
    stageRoot.remove(stageModel)
    stageModel = null
  }
  if (heroSculpture) heroSculpture.visible = true
  if (beaconPoints) beaconPoints.visible = true
  if (haloPoints) haloPoints.visible = true
  cityNodes.forEach((n) => {
    n.group.visible = true
    gsap.to(n.group.scale, { x: 0.42, y: 0.42, z: 0.42, duration: 0.5 })
  })
}

// ── 地图 UI ──
const mapUI = createMapUI()

let activeRoute: Route = ROUTES[0]
let activeCityId: string | null = null

function cityCamTarget(cityId: string): CamTarget {
  const node = cityNodes.get(cityId)
  const focus = node ? node.worldPos.clone() : new THREE.Vector3(0, 10, 0)
  // createCityModel 统一归一化到约 8 单位，固定取景距离即可稳妥
  const R = 11
  const pos = focus.clone().add(new THREE.Vector3(R * 0.55, R * 0.42, R * 0.95))
  return {
    pos,
    look: focus.clone().add(new THREE.Vector3(0, 0.2, 0)),
    fov: 42,
  }
}

function enterCity(cityId: string): void {
  activeCityId = cityId
  const city = CITY_BY_ID[cityId]
  if (!city) return

  mountStageModel(cityId)
  // 飞向城市（宏观→微观）
  const target = cityCamTarget(cityId)
  flyCamera(target, 1.35)
  // 飞行结束后开放拖拽环视
  gsap.delayedCall(1.35, () => {
    if (activeCityId === cityId) {
      enableOrbit(target.look.clone(), target.pos.distanceTo(target.look))
    }
  })

  // 压暗/隐藏其它城
  cityNodes.forEach((node, id) => {
    if (id !== cityId) {
      node.group.visible = false
    } else {
      node.group.visible = false // 小城也藏，只看舞台大模型
    }
    gsap.to(node.group.scale, { x: 0.22, y: 0.22, z: 0.22, duration: 0.7, ease: 'power2.out' })
  })
  if (heroSculpture) heroSculpture.visible = false

  const idx = cityIndexInRoute(activeRoute, cityId)
  const theme = THEME_BY_ID[city.theme]
  mapUI.openCity(
    { ...city, theme: theme.name as never },
    activeRoute,
    idx >= 0 ? idx : 0,
    activeRoute.cityIds.length
  )
  mapUI.setRouteActive(activeRoute.id)
  // 主题色
  const themeEl = document.getElementById('overlay-theme')
  if (themeEl) {
    themeEl.textContent = theme.name
    themeEl.style.color = theme.color
  }
}

function exitCity(): void {
  activeCityId = null
  disableOrbit()
  unmountStageModel()
  mapUI.closeCity()
  flyCamera(MAP_CAM, 1.2)
  cityNodes.forEach((node) => {
    gsap.to(node.group.scale, { x: 0.42, y: 0.42, z: 0.42, duration: 0.9, ease: 'power2.out' })
  })
}

function stepCity(dir: number): void {
  const ids = activeRoute.cityIds
  if (!activeCityId) {
    if (ids[0]) enterCity(ids[0])
    return
  }
  const idx = ids.indexOf(activeCityId)
  const next = ids[(idx + dir + ids.length) % ids.length]
  if (next) enterCity(next)
}

mapUI.bind({
  onClose: exitCity,
  onPrev: () => stepCity(-1),
  onNext: () => stepCity(1),
  onRoute: (routeId: string) => {
    activeRoute = routeById(routeId)
    mapUI.setRouteActive(activeRoute.id)
    // 切路线后跳到该路线第一城
    const first = activeRoute.cityIds[0]
    if (first) enterCity(first)
  },
})

// 地图标签：投影定位
const labelPositions: Array<{ id: string; x: number; y: number; visible: boolean }> = []

function buildMapLabels(): void {
  const labels = CITIES.map((c) => {
    const theme = THEME_BY_ID[c.theme]
    return {
      id: c.id,
      zh: c.zh,
      themeColor: theme.color,
      x: 0,
      y: 0,
    }
  })
  mapUI.setLabels(labels)
  mapUI.showMapLabels(true)
  CITIES.forEach((c) => labelPositions.push({ id: c.id, x: 0, y: 0, visible: true }))
}

buildMapLabels()
document.body.classList.add('map-mode')

// 标签点击
document.getElementById('map-labels')?.addEventListener('click', (e) => {
  const t = e.target as HTMLElement
  const btn = t.closest('[data-city-id]') as HTMLElement | null
  if (btn?.dataset.cityId) enterCity(btn.dataset.cityId)
})

// 3D 拾取：点城市雕塑
const raycaster = new THREE.Raycaster()
const pointerNdc = new THREE.Vector2()
canvas.addEventListener('pointerdown', (e) => {
  if (mapUI.isOpen) return
  pointerNdc.x = (e.clientX / window.innerWidth) * 2 - 1
  pointerNdc.y = -(e.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(pointerNdc, camera)
  const hits = raycaster.intersectObjects(scene.children, true)
  for (const hit of hits) {
    let o: THREE.Object3D | null = hit.object
    while (o) {
      const cityId = o.userData?.cityId as string | undefined
      if (cityId) {
        enterCity(cityId)
        return
      }
      o = o.parent
    }
  }
})

function onCityClick(cityId: string): void {
  enterCity(cityId)
}

function onThemeJump(themeId: string): void {
  const sec = document.querySelector(`[data-section="theme-${themeId}"]`)
  if (sec) {
    window.scrollTo({
      top: (sec as HTMLElement).offsetTop - 40,
      behavior: 'smooth',
    })
  }
}

buildThemeSections(themeRoot, onCityClick)
buildAtlas(atlasGrid, onCityClick)
buildNav(themeNav, onThemeJump)

// 进度 / 章节
createScrollTracker({
  onProgress(p) {
    scroll.p = p
    progressFill.style.height = `${(p * 100).toFixed(2)}%`
  },
  onSection(current, label) {
    scroll.section = current
    scroll.label = label
    progressLabel.textContent = label
    // 导航高亮
    themeNav.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('is-active', current === `theme-${btn.dataset.theme}`)
    })
  },
})

observeReveals()

// 回到顶部
mustEl('back-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

/* ═══════════════════════════════════════════
   城市聚焦
   ═══════════════════════════════════════════ */

const focusCam = {
  pos: new THREE.Vector3(11, 8, 13),
  look: new THREE.Vector3(0, 2.2, 0),
  fov: 36,
  active: false,
}

function focusCity(cityId: string): void {
  const node = cityNodes.get(cityId)
  focusCam.active = true

  // 舞台模型放在原点，相机绕原点取景
  focusCam.pos.set(10.5, 8.5, 14)
  focusCam.look.set(-2.0, 1.8, 0)
  focusCam.fov = 40

  if (node) {
    // 提亮该雕塑（背景星座）
    node.group.traverse((obj) => {
      const o = obj as THREE.Mesh
      if ((obj as THREE.LineSegments).isLineSegments && o.material) {
        ;(o.material as THREE.Material).opacity = 0.5
      }
    })
  }

  // 压暗背景星座
  cityNodes.forEach((other) => {
    gsap.to(other.group.scale, {
      x: 0.28,
      y: 0.28,
      z: 0.28,
      duration: 0.7,
      ease: 'power2.out',
    })
  })
}



/* ═══════════════════════════════════════════
   Hero 入场动画
   ═══════════════════════════════════════════ */

function playIntro(): void {
  // 雕塑入场：从星尘放大成形
  let introIndex = 0
  cityNodes.forEach((node) => {
    const delay = 0.15 + (introIndex % 12) * 0.06
    introIndex++
    node.group.scale.setScalar(0.01)
    gsap.to(node.group.scale, {
      x: 0.42,
      y: 0.42,
      z: 0.42,
      duration: 1.6,
      delay,
      ease: 'power3.out',
    })
  })
  if (heroSculpture) {
    heroSculpture.scale.setScalar(0.2)
    gsap.to(heroSculpture.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.8,
      delay: 0.25,
      ease: 'power3.out',
    })
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 1.0 }, 0.15)
    .to('.hero-line', { opacity: 1, y: 0, duration: 1.15, stagger: 0.14 }, 0.3)
    .to('.hero-sub', { opacity: 1, y: 0, duration: 1.0 }, 0.7)
    .to('.hero-meta', { opacity: 1, y: 0, duration: 1.0 }, 0.95)
    .to('.hero-scroll', { opacity: 1, duration: 1.0 }, 1.2)
}

/* ═══════════════════════════════════════════
   渲染循环
   ═══════════════════════════════════════════ */

const clock = new THREE.Clock()
function tick(): void {
  requestAnimationFrame(tick)
  const t = clock.getElapsedTime()

  // 滚动平滑
  scroll.smooth += (scroll.p - scroll.smooth) * 0.07

  orbitTick()

  // 相机
  if (orbit.enabled) {
    camera.position.copy(camSmooth.pos)
  } else {
    const parallaxX = mouse.x * 1.1
    const parallaxY = mouse.y * -0.8
    camera.position.copy(camSmooth.pos)
    camera.position.x += parallaxX
    camera.position.y += parallaxY
  }
  camera.lookAt(camSmooth.look)
  if (Math.abs(camera.fov - camSmooth.fov) > 0.01) {
    camera.fov = camSmooth.fov
    camera.updateProjectionMatrix()
  }

  // 地图标签投影
  if (!mapUI.isOpen) {
    const w = window.innerWidth
    const h = window.innerHeight
    for (const lp of labelPositions) {
      const node = cityNodes.get(lp.id)
      if (!node) continue
      const v = node.worldPos.clone()
      v.y += 3.2
      v.project(camera)
      const x = (v.x * 0.5 + 0.5) * w
      const y = (-v.y * 0.5 + 0.5) * h
      lp.x = x
      lp.y = y
      lp.visible = v.z < 1 && x > -40 && x < w + 40 && y > -20 && y < h + 20
    }
    // 标签避让：屏幕坐标排序后，重叠则隐藏
    const used: Array<{ x: number; y: number }> = []
    const MIN_DX = 72
    const MIN_DY = 28
    for (const lp of labelPositions) {
      if (!lp.visible) continue
      let clash = false
      for (const u of used) {
        if (Math.abs(lp.x - u.x) < MIN_DX && Math.abs(lp.y - u.y) < MIN_DY) {
          clash = true
          break
        }
      }
      if (!clash) used.push({ x: lp.x, y: lp.y })
      lp.visible = lp.visible && !clash
    }
    mapUI.updateLabelPositions(labelPositions)
  }

  // 舞台模型：无自动旋转，由拖拽环视控制
  if (stageModel && stageRoot.visible && orbit.enabled) {
    // 平滑惯性已在 orbit.update 中处理
  }

  // 雕塑呼吸
  constellation.updates.forEach((u) => u(t))
  if (heroSculpture && heroSculpture.visible) {
    heroSculpture.rotation.y += 0.0008
    heroSculpture.position.y = 10 + Math.sin(t * 0.28) * 0.35
  }

  // 信标呼吸（Points 整体轻脉动）
  {
    const pulse = 1 + Math.sin(t * 1.2) * 0.08
    const bMat = beaconPoints.material as THREE.PointsMaterial
    const hMat = haloPoints.material as THREE.PointsMaterial
    bMat.size = 1.1 * pulse
    hMat.size = 3.2 * pulse
    hMat.opacity = 0.1 + Math.sin(t * 0.8) * 0.03
  }

  // 灯光/雾随主题微调
  if (scroll.section?.startsWith('theme-')) {
    world.lightTarget.fogDensity = 0.0105
    world.lightTarget.exposure = 1.08
  } else if (scroll.section === 'atlas') {
    world.lightTarget.fogDensity = 0.0075
    world.lightTarget.exposure = 1.12
  } else {
    world.lightTarget.fogDensity = 0.0095
    world.lightTarget.exposure = 1.05
  }

  world.render()
}

/* ═══════════════════════════════════════════
   加载完成 → 揭幕
   ═══════════════════════════════════════════ */

function boot(): void {
  const loader = mustEl('loader')
  // 预热一帧
  world.render()
  requestAnimationFrame(() => {
    loader.classList.add('is-done')
    playIntro()
    tick()
  })
}

// 等字体/布局
if (document.fonts?.ready) {
  document.fonts.ready.then(boot).catch(boot)
} else {
  window.addEventListener('load', boot)
  // 兜底
  setTimeout(boot, 400)
}

// 调试：在 window 上挂一点句柄
declare global {
  interface Window {
    __invisibleCities?: {
      world: typeof world
      cityNodes: typeof cityNodes
      focusCity: typeof focusCity
      scroll: typeof scroll
    }
  }
}

window.__invisibleCities = {
  world,
  cityNodes,
  focusCity,
  scroll,
}
