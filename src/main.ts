import * as THREE from 'three'
import gsap from 'gsap'
import { THEMES, CITIES, THEME_BY_ID, citiesOfTheme } from './data/cities'
import { createWorld } from './scene/world'
import { createCitySculpture, setEdgeBudget } from './scene/cityGeometry'
import {
  buildThemeSections,
  buildAtlas,
  buildNav,
  createScrollTracker,
  observeReveals,
} from './ui/narrative'
import { createOverlay } from './ui/overlay'

/* ═══════════════════════════════════════════
   启动
   ═══════════════════════════════════════════ */

const canvas = document.getElementById('gl') as HTMLCanvasElement
const world = createWorld(canvas)
const { scene, camera } = world

// 光标 — 只写 transform，零布局
const cursor = mustEl('cursor')
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
   相机路径 — 滚动驱动
   ═══════════════════════════════════════════ */

/**
 * 相机关键帧（按滚动进度 0-1）
 * 位置 / 注视点 / FOV
 */
const camKeys = [
  // 0 Hero — 右侧主雕塑 + 背景星系
  { p: 0.0, pos: [10, 14, 48], look: [18, 12, 0], fov: 40 },
  // Frame — 回到全景
  { p: 0.08, pos: [6, 16, 50], look: [0, 14, 0], fov: 40 },
  // 主题旅程 — 绕螺旋内移
  { p: 0.16, pos: [22, 22, 36], look: [10, 18, 2], fov: 38 },
  { p: 0.28, pos: [32, 24, 16], look: [16, 20, 6], fov: 36 },
  { p: 0.40, pos: [24, 26, -18], look: [8, 21, -6], fov: 36 },
  { p: 0.52, pos: [-4, 28, -34], look: [-4, 22, -4], fov: 36 },
  { p: 0.64, pos: [-30, 26, -12], look: [-12, 21, 2], fov: 36 },
  { p: 0.76, pos: [-32, 24, 18], look: [-10, 18, 4], fov: 38 },
  // Atlas — 俯瞰
  { p: 0.88, pos: [0, 54, 34], look: [0, 12, 0], fov: 44 },
  // Epilogue — 拉远
  { p: 1.0, pos: [0, 22, 64], look: [0, 16, 0], fov: 42 },
]

function sampleCamPath(p: number): { pos: THREE.Vector3; look: THREE.Vector3; fov: number } {
  const t = Math.max(0, Math.min(1, p))
  let i = 0
  while (i < camKeys.length - 2 && camKeys[i + 1].p < t) i++
  const a = camKeys[i]
  const b = camKeys[i + 1]
  const span = b.p - a.p || 1
  const local = (t - a.p) / span
  // smoothstep
  const s = local * local * (3 - 2 * local)

  const pos = new THREE.Vector3(
    a.pos[0] + (b.pos[0] - a.pos[0]) * s,
    a.pos[1] + (b.pos[1] - a.pos[1]) * s,
    a.pos[2] + (b.pos[2] - a.pos[2]) * s
  )
  const look = new THREE.Vector3(
    a.look[0] + (b.look[0] - a.look[0]) * s,
    a.look[1] + (b.look[1] - a.look[1]) * s,
    a.look[2] + (b.look[2] - a.look[2]) * s
  )
  const fov = a.fov + (b.fov - a.fov) * s
  return { pos, look, fov }
}

const camSmooth = {
  pos: new THREE.Vector3(10, 14, 48),
  look: new THREE.Vector3(18, 12, 0),
  fov: 40,
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

const overlay = createOverlay({
  onSelect(cityId) {
    focusCity(cityId)
  },
  onClose() {
    releaseFocus()
  },
})

function onCityClick(cityId: string): void {
  overlay.open(cityId)
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
  pos: new THREE.Vector3(),
  look: new THREE.Vector3(),
  active: false,
}

function focusCity(cityId: string): void {
  const node = cityNodes.get(cityId)
  if (!node) return
  focusCam.active = true

  const offset = new THREE.Vector3(10, 7, 12)
  focusCam.pos.copy(node.worldPos).add(offset)
  focusCam.look.copy(node.worldPos)

  // 提亮该雕塑
  node.group.traverse((obj) => {
    const o = obj as THREE.Mesh
    if ((obj as THREE.LineSegments).isLineSegments && o.material) {
      ;(o.material as THREE.Material).opacity = 0.55
    }
    if (o.isMesh && o.material && (o.material as THREE.MeshStandardMaterial).emissive) {
      const m = o.material as THREE.MeshStandardMaterial
      m.emissive.setHex(0x332211)
      m.emissiveIntensity = 0.15
    }
  })

  // 压暗其他
  cityNodes.forEach((other, id) => {
    if (id === cityId) return
    gsap.to(other.group.scale, {
      x: 0.42,
      y: 0.42,
      z: 0.42,
      duration: 0.8,
      ease: 'power2.out',
    })
  })
  gsap.to(node.group.scale, {
    x: 1.35,
    y: 1.35,
    z: 1.35,
    duration: 0.9,
    ease: 'power3.out',
  })
}

function releaseFocus(): void {
  focusCam.active = false
  cityNodes.forEach((node) => {
    gsap.to(node.group.scale, {
      x: 0.42,
      y: 0.42,
      z: 0.42,
      duration: 0.85,
      ease: 'power2.out',
      overwrite: true,
    })
    node.group.traverse((obj) => {
      const o = obj as THREE.Mesh
      if ((obj as THREE.LineSegments).isLineSegments && o.material) {
        ;(o.material as THREE.Material).opacity = 0.28
      }
      if (o.isMesh && o.material && (o.material as THREE.MeshStandardMaterial).emissive) {
        ;(o.material as THREE.MeshStandardMaterial).emissiveIntensity = 0
      }
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

  // 光标插值
  cursorState.x += (cursorState.tx - cursorState.x) * 0.22
  cursorState.y += (cursorState.ty - cursorState.y) * 0.22
  cursor.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0)`

  // 滚动平滑
  scroll.smooth += (scroll.p - scroll.smooth) * 0.07

  // 相机
  if (focusCam.active) {
    camSmooth.pos.lerp(focusCam.pos, 0.055)
    camSmooth.look.lerp(focusCam.look, 0.055)
  } else {
    const target = sampleCamPath(scroll.smooth)
    camSmooth.pos.lerp(target.pos, 0.06)
    camSmooth.look.lerp(target.look, 0.06)
    camSmooth.fov += (target.fov - camSmooth.fov) * 0.06
  }

  // 鼠标视差
  const parallaxX = mouse.x * 1.6
  const parallaxY = mouse.y * -1.1
  camera.position.copy(camSmooth.pos)
  camera.position.x += parallaxX
  camera.position.y += parallaxY
  camera.lookAt(camSmooth.look)
  if (Math.abs(camera.fov - camSmooth.fov) > 0.01) {
    camera.fov = camSmooth.fov
    camera.updateProjectionMatrix()
  }

  // 雕塑呼吸
  constellation.updates.forEach((u) => u(t))
  if (heroSculpture) {
    heroSculpture.rotation.y += 0.0008
    heroSculpture.position.y = 10 + Math.sin(t * 0.28) * 0.35
    // Hero 之后淡出主雕塑
    const heroFade = 1 - Math.min(1, scroll.smooth * 10)
    heroSculpture.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined
      if (mat && typeof mat.opacity === 'number') {
        const base = (obj.userData.baseOpacity as number | undefined) ?? mat.opacity
        obj.userData.baseOpacity = base
        mat.opacity = base * Math.max(0, heroFade)
      }
    })
    heroSculpture.visible = heroFade > 0.02
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
