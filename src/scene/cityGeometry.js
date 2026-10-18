import * as THREE from 'three'

/**
 * 程序化城市雕塑 — 按 11 类主题生成半透明纸感建筑体
 * 统一材质语言：半透明纸/石膏 + 墨线描边
 */

// 可复现随机
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function paperMaterial(color, opacity = 0.62, roughness = 0.86) {
  // 不透明纸感：跳过透明排序，1000+ 物体才能稳
  // opacity > 0.72 的构件才开透明（数量少）
  const useTransparent = opacity < 0.72
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    transparent: useTransparent,
    opacity: useTransparent ? opacity * 0.92 : 1,
    roughness,
    metalness: 0.02,
    side: useTransparent ? THREE.DoubleSide : THREE.FrontSide,
    depthWrite: true,
    flatShading: true,
  })
}

function inkEdges(mesh, opacity = 0.28, color = 0x2a2420) {
  const edges = new THREE.EdgesGeometry(mesh.geometry, 25)
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: opacity * 0.95,
    })
  )
  line.position.copy(mesh.position)
  line.rotation.copy(mesh.rotation)
  line.scale.copy(mesh.scale)
  return line
}

let edgeBudget = Infinity // 由 main.js 设置；0 = 不描边

export function setEdgeBudget(n) {
  edgeBudget = n
}

function addWithEdges(group, mesh, edgeOpacity = 0.28) {
  group.add(mesh)
  if (edgeBudget <= 0) return
  mesh.geometry.computeBoundingSphere?.()
  const r = mesh.geometry.boundingSphere?.radius ?? 1
  const maxScale = Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z, 1)
  // 仅对较大的构件描边，且受预算约束
  if (r * maxScale >= 0.7 && edgeBudget > 0) {
    edgeBudget--
    group.add(inkEdges(mesh, edgeOpacity))
  }
}

// ── 主题雕塑生成器 ───────────────────────────

function buildMemory(rng, palette) {
  const g = new THREE.Group()
  // 分层平台
  for (let i = 0; i < 5; i++) {
    const w = 6.5 - i * 0.85
    const h = 0.35 + rng() * 0.25
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, w * (0.7 + rng() * 0.3)),
      paperMaterial(palette.stone, 0.78)
    )
    mesh.position.y = i * 1.15
    mesh.rotation.y = rng() * 0.4 - 0.2
    addWithEdges(g, mesh, 0.3)
  }
  // 浮空记忆碎片
  for (let i = 0; i < 8; i++) {
    const s = 0.35 + rng() * 0.7
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, s * (0.6 + rng()), s),
      paperMaterial(palette.accent, 0.5 + rng() * 0.15)
    )
    const a = rng() * Math.PI * 2
    const r = 2.2 + rng() * 3.2
    mesh.position.set(
      Math.cos(a) * r,
      1.5 + rng() * 5.5,
      Math.sin(a) * r * 0.75
    )
    mesh.rotation.set(rng() * 0.6, rng() * Math.PI, rng() * 0.5)
    addWithEdges(g, mesh, 0.22)
  }
  return g
}

function buildDesire(rng, palette) {
  const g = new THREE.Group()
  // 螺旋塔
  const steps = 22
  for (let i = 0; i < steps; i++) {
    const t = i / steps
    const s = 1.6 - t * 1.1
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, 0.38, s),
      paperMaterial(i % 3 === 0 ? palette.accent : palette.stone, 0.72)
    )
    const a = t * Math.PI * 3.2
    const r = 0.4 + t * 2.8
    mesh.position.set(Math.cos(a) * r, i * 0.52, Math.sin(a) * r)
    mesh.rotation.y = a
    addWithEdges(g, mesh, 0.26)
  }
  // 曲线壳体
  const shell = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.35, 8, 32, Math.PI * 1.35),
    paperMaterial(palette.accent, 0.5)
  )
  shell.position.y = 4.5
  shell.rotation.x = Math.PI / 2.4
  addWithEdges(g, shell, 0.2)
  // 核心球
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.15, 1),
    paperMaterial(palette.warm, 0.65)
  )
  core.position.y = 2.2
  addWithEdges(g, core, 0.28)
  return g
}

function buildSigns(rng, palette) {
  const g = new THREE.Group()
  // 镜面片阵
  for (let i = 0; i < 16; i++) {
    const w = 1.2 + rng() * 1.8
    const h = 1.8 + rng() * 3.5
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, h, w),
      paperMaterial(palette.stone, 0.62)
    )
    const a = (i / 16) * Math.PI * 2
    const r = 2.2 + (i % 3) * 1.1
    mesh.position.set(Math.cos(a) * r, h * 0.45, Math.sin(a) * r)
    mesh.rotation.y = a + Math.PI / 2
    addWithEdges(g, mesh, 0.32)
  }
  // 符号板
  for (let i = 0; i < 6; i++) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 2.2, 0.1),
      paperMaterial(palette.accent, 0.45)
    )
    const a = rng() * Math.PI * 2
    mesh.position.set(Math.cos(a) * 3.5, 2 + i * 0.9, Math.sin(a) * 3.5)
    mesh.rotation.set(rng() * 0.4, a, rng() * 0.3)
    addWithEdges(g, mesh, 0.25)
  }
  // 中心棱柱
  const prism = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 1.1, 7, 6),
    paperMaterial(palette.warm, 0.7)
  )
  prism.position.y = 3.5
  addWithEdges(g, prism, 0.3)
  return g
}

function buildThin(rng, palette) {
  const g = new THREE.Group()
  // 极细丝架 — 四根高柱
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const h = 8 + rng() * 3
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, h, 6),
      paperMaterial(palette.slate, 0.75)
    )
    mesh.position.set(Math.cos(a) * 3.2, h / 2, Math.sin(a) * 3.2)
    addWithEdges(g, mesh, 0.2)
  }
  // 薄片悬浮
  for (let i = 0; i < 9; i++) {
    const s = 2.2 + rng() * 2.8
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, 0.08, s * (0.5 + rng() * 0.5)),
      paperMaterial(i % 2 ? palette.stone : palette.accent, 0.5)
    )
    const a = rng() * Math.PI * 2
    const r = 0.5 + rng() * 3
    mesh.position.set(Math.cos(a) * r, 1.2 + i * 0.85, Math.sin(a) * r)
    mesh.rotation.set(rng() * 0.15, rng() * Math.PI, rng() * 0.12)
    addWithEdges(g, mesh, 0.22)
  }
  // 顶部细环
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.06, 8, 48),
    paperMaterial(palette.accent, 0.55)
  )
  ring.position.y = 9.5
  ring.rotation.x = Math.PI / 2
  addWithEdges(g, ring, 0.18)
  return g
}

function buildTrade(rng, palette) {
  const g = new THREE.Group()
  // 桥接网格
  for (let i = 0; i < 7; i++) {
    const len = 4 + rng() * 5
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.22, 0.55),
      paperMaterial(palette.stone, 0.7)
    )
    const a = rng() * Math.PI * 2
    mesh.position.set(
      Math.cos(a) * (2 + rng() * 2),
      1.2 + i * 0.95,
      Math.sin(a) * (2 + rng() * 2)
    )
    mesh.rotation.y = a + rng() * 0.8
    addWithEdges(g, mesh, 0.28)
  }
  // 摊位方块群
  for (let i = 0; i < 12; i++) {
    const s = 0.5 + rng() * 0.75
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, s * (0.7 + rng() * 0.8), s),
      paperMaterial(rng() > 0.6 ? palette.accent : palette.warm, 0.68)
    )
    const a = rng() * Math.PI * 2
    const r = 1.2 + rng() * 4
    mesh.position.set(Math.cos(a) * r, s * 0.4, Math.sin(a) * r)
    mesh.rotation.y = rng() * Math.PI
    addWithEdges(g, mesh, 0.28)
  }
  // 中央枢纽
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.8, 3.2, 8),
    paperMaterial(palette.stone, 0.75)
  )
  hub.position.y = 1.6
  addWithEdges(g, hub, 0.32)
  return g
}

function buildEyes(rng, palette) {
  const g = new THREE.Group()
  // 环形观测台
  for (let i = 0; i < 3; i++) {
    const r = 4.2 - i * 1.1
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.18, 8, 48),
      paperMaterial(i === 1 ? palette.accent : palette.stone, 0.7)
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 1.2 + i * 2.1
    addWithEdges(g, ring, 0.22)
  }
  // 核心球体
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 24, 18),
    paperMaterial(palette.warm, 0.55)
  )
  eye.position.y = 4.2
  addWithEdges(g, eye, 0.25)
  // 放射细柱
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const h = 5 + rng() * 3.5
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.1, h, 5),
      paperMaterial(palette.slate, 0.6)
    )
    mesh.position.set(Math.cos(a) * 5.5, h / 2, Math.sin(a) * 5.5)
    addWithEdges(g, mesh, 0.18)
  }
  return g
}

function buildNames(rng, palette) {
  const g = new THREE.Group()
  // 字碑林
  for (let i = 0; i < 12; i++) {
    const w = 0.7 + rng() * 0.9
    const h = 2.5 + rng() * 5
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, w * 0.55),
      paperMaterial(i % 4 === 0 ? palette.accent : palette.stone, 0.72)
    )
    const a = rng() * Math.PI * 2
    const r = 1.2 + rng() * 4.2
    mesh.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r)
    mesh.rotation.y = rng() * Math.PI
    addWithEdges(g, mesh, 0.32)
  }
  // 横梁
  for (let i = 0; i < 4; i++) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(7.5 - i * 1.2, 0.18, 0.5),
      paperMaterial(palette.warm, 0.6)
    )
    mesh.position.y = 2.2 + i * 1.35
    mesh.rotation.y = i * 0.45
    addWithEdges(g, mesh, 0.25)
  }
  return g
}

function buildDead(rng, palette) {
  const g = new THREE.Group()
  // 下沉阶梯（倒金字塔感）
  for (let i = 0; i < 7; i++) {
    const s = 7 - i * 0.9
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, 0.45, s * 0.85),
      paperMaterial(i % 2 ? palette.stone : palette.slate, 0.75)
    )
    mesh.position.y = -i * 0.7
    mesh.rotation.y = i * 0.12
    addWithEdges(g, mesh, 0.32)
  }
  // 上升棱柱 — 活人的注脚
  for (let i = 0; i < 5; i++) {
    const h = 1.5 + rng() * 2.5
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, h, 5),
      paperMaterial(palette.accent, 0.55)
    )
    const a = rng() * Math.PI * 2
    mesh.position.set(Math.cos(a) * 2.8, h / 2, Math.sin(a) * 2.8)
    addWithEdges(g, mesh, 0.22)
  }
  // 中心碑
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 4.5, 0.35),
    paperMaterial(palette.warm, 0.8)
  )
  slab.position.y = 1.2
  addWithEdges(g, slab, 0.35)
  return g
}

function buildSky(rng, palette) {
  const g = new THREE.Group()
  // 上升柱廊
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2
    const h = 6 + rng() * 5
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, h, 7),
      paperMaterial(palette.stone, 0.72)
    )
    const r = 3.2 + (i % 2) * 1.3
    mesh.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r)
    addWithEdges(g, mesh, 0.26)
  }
  // 同心升环
  for (let i = 0; i < 5; i++) {
    const r = 2 + i * 1.05
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.1, 8, 56),
      paperMaterial(i === 2 ? palette.accent : palette.slate, 0.55)
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 2.5 + i * 1.35
    addWithEdges(g, ring, 0.18)
  }
  // 顶部光核
  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.1, 0),
    paperMaterial(palette.accent, 0.5)
  )
  core.position.y = 10.2
  addWithEdges(g, core, 0.28)
  return g
}

function buildContinuous(rng, palette) {
  const g = new THREE.Group()
  // 无限重复街区网格（3×3，控制 draw call）
  const grid = 3
  for (let x = -grid; x <= grid; x++) {
    for (let z = -grid; z <= grid; z++) {
      if (Math.abs(x) + Math.abs(z) > grid + 1) continue
      const h = 0.8 + rng() * 3.2 + (Math.abs(x) + Math.abs(z)) * 0.15
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, h, 0.85),
        paperMaterial(
          rng() > 0.72 ? palette.accent : palette.stone,
          0.68 + rng() * 0.12
        )
      )
      mesh.position.set(x * 1.35, h / 2, z * 1.35)
      addWithEdges(g, mesh, 0.28)
    }
  }
  // 贯穿长桥
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.18, 0.6),
    paperMaterial(palette.warm, 0.65)
  )
  bridge.position.y = 3.8
  addWithEdges(g, bridge, 0.22)
  const bridge2 = bridge.clone()
  bridge2.rotation.y = Math.PI / 2
  addWithEdges(g, bridge2, 0.22)
  return g
}

function buildHidden(rng, palette) {
  const g = new THREE.Group()
  // 围合迷宫墙
  const walls = 10
  for (let i = 0; i < walls; i++) {
    const a = (i / walls) * Math.PI * 2
    const r = 4.5 + (i % 2) * 0.8
    const h = 2.2 + rng() * 2.8
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, h, 0.28),
      paperMaterial(palette.stone, 0.78)
    )
    mesh.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r)
    mesh.rotation.y = a + Math.PI / 2
    addWithEdges(g, mesh, 0.34)
  }
  // 内向庭院台阶
  for (let i = 0; i < 5; i++) {
    const s = 3.2 - i * 0.55
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(s, 0.32, s),
      paperMaterial(i === 2 ? palette.accent : palette.warm, 0.72)
    )
    mesh.position.y = i * 0.55
    mesh.rotation.y = i * 0.2
    addWithEdges(g, mesh, 0.28)
  }
  // 隐藏光核
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.7, 0),
    paperMaterial(palette.accent, 0.55)
  )
  core.position.y = 2.8
  addWithEdges(g, core, 0.3)
  return g
}

const BUILDERS = {
  memory: buildMemory,
  desire: buildDesire,
  signs: buildSigns,
  thin: buildThin,
  trade: buildTrade,
  eyes: buildEyes,
  names: buildNames,
  dead: buildDead,
  sky: buildSky,
  continuous: buildContinuous,
  hidden: buildHidden,
}

// 主题色板（与 CSS 呼应）
const PALETTES = {
  memory: { stone: 0xd8cfc0, accent: 0xc45c3e, warm: 0xe8dcc8, slate: 0xa8b0b4 },
  desire: { stone: 0xd4c4b8, accent: 0xb85a4a, warm: 0xe4d0c0, slate: 0xa89890 },
  signs: { stone: 0xd0c4b0, accent: 0x8b6b4a, warm: 0xe0d4bc, slate: 0xa89880 },
  thin: { stone: 0xc8d0d4, accent: 0x6b8f9e, warm: 0xdce4e8, slate: 0x8a9aa4 },
  trade: { stone: 0xd4c8b0, accent: 0xa67c52, warm: 0xe4d8c0, slate: 0xa89880 },
  eyes: { stone: 0xc4cdd4, accent: 0x5c7a8a, warm: 0xd8e0e6, slate: 0x8a9aa8 },
  names: { stone: 0xc8c0d0, accent: 0x7a6b8a, warm: 0xdcd4e0, slate: 0x9890a0 },
  dead: { stone: 0xb8b8b4, accent: 0x6b6b6b, warm: 0xd0d0cc, slate: 0x90908c },
  sky: { stone: 0xc4d0d8, accent: 0x7a9eaa, warm: 0xd8e4ea, slate: 0x90a4b0 },
  continuous: { stone: 0xd0c8b4, accent: 0x8a7a5c, warm: 0xe0d8c4, slate: 0xa89880 },
  hidden: { stone: 0xc0c8c0, accent: 0x5c6b5c, warm: 0xd4dcd4, slate: 0x90a090 },
}

/**
 * 创建一座城的雕塑
 * @returns {{ group: THREE.Group, update: (t:number)=>void }}
 */
export function createCitySculpture(themeId, seed, scale = 1) {
  const rng = mulberry32(seed * 9973 + 17)
  const palette = PALETTES[themeId] || PALETTES.memory
  const builder = BUILDERS[themeId] || buildMemory
  const group = builder(rng, palette)
  group.scale.setScalar(scale)
  group.userData.themeId = themeId
  group.userData.seed = seed

  const spin = 0.0006 + rng() * 0.0012
  const bobAmp = 0.12 + rng() * 0.22
  const bobFreq = 0.25 + rng() * 0.35
  const phase = rng() * Math.PI * 2

  function update(t) {
    group.rotation.y += spin
    group.position.y = Math.sin(t * bobFreq + phase) * bobAmp
  }

  return { group, update }
}

/**
 * 创建星图中的小光点（总览用）
 */
export function createCityBeacon(colorHex, size = 1) {
  const g = new THREE.Group()
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.22 * size, 12, 10),
    new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.9,
    })
  )
  g.add(core)

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.55 * size, 12, 10),
    new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    })
  )
  g.add(halo)

  // 细环
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.7 * size, 0.018, 6, 32),
    new THREE.MeshBasicMaterial({
      color: 0xc4a574,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  )
  ring.rotation.x = Math.PI / 2
  g.add(ring)

  return g
}
