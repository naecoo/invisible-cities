import * as THREE from 'three'

/**
 * 城市场景环境件 — 地面 / 水体 / 建筑 / 人物 / 光影
 * 供 cityModels 组合出贴合原著的完整场景
 */

export type Rng = () => number

export function mulberry32(a: number): Rng {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const PALETTE = {
  paper: 0xf0e6d6,
  stone: 0xd8cbb8,
  marble: 0xefe8dc,
  sand: 0xe0d0b4,
  earth: 0x8a6a4e,
  grass: 0x8a9a72,
  water: 0x7a9aaa,
  waterDeep: 0x4a7a8a,
  ink: 0x2a2420,
  wood: 0x8a6a4a,
  metal: 0x9a9aa0,
  rust: 0x8a5a42,
  vermilion: 0xc45c3e,
  gold: 0xc4a574,
  slate: 0x6a7a84,
  glass: 0xb8d0d8,
  skin: 0xd4a88a,
  cloth: 0x6a5a7a,
  leaf: 0x6a8a5a,
}

export function mat(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0.04,
    flatShading: true,
    ...opts,
  })
}

function soft(color: number, opacity = 0.85) {
  return mat(color, { transparent: opacity < 1, opacity, roughness: 0.9 })
}

// ── 基础几何 ─────────────────────────────

export function box(
  g: THREE.Group,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
  ry = 0,
  matOpts?: Partial<THREE.MeshStandardMaterialParameters>
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, matOpts))
  m.position.set(x, y, z)
  m.rotation.y = ry
  m.castShadow = true
  m.receiveShadow = true
  g.add(m)
  return m
}

export function cyl(
  g: THREE.Group,
  r1: number,
  r2: number,
  h: number,
  color: number,
  x: number,
  y: number,
  z: number,
  seg = 12,
  matOpts?: Partial<THREE.MeshStandardMaterialParameters>
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat(color, matOpts))
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  g.add(m)
  return m
}

export function sphere(
  g: THREE.Group,
  r: number,
  color: number,
  x: number,
  y: number,
  z: number,
  matOpts?: Partial<THREE.MeshStandardMaterialParameters>
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat(color, matOpts))
  m.position.set(x, y, z)
  m.castShadow = true
  g.add(m)
  return m
}

export function torus(
  g: THREE.Group,
  r: number,
  t: number,
  color: number,
  x: number,
  y: number,
  z: number,
  rx = Math.PI / 2,
  matOpts?: Partial<THREE.MeshStandardMaterialParameters>
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 32), mat(color, matOpts))
  m.position.set(x, y, z)
  m.rotation.x = rx
  g.add(m)
  return m
}

export function line(
  g: THREE.Group,
  points: THREE.Vector3[],
  color: number,
  opacity = 0.4
): void {
  const geo = new THREE.BufferGeometry().setFromPoints(points)
  g.add(
    new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }))
  )
}

// ── 地面 / 地形 ──────────────────────────

export type GroundKind = 'stone' | 'sand' | 'grass' | 'earth' | 'snow' | 'none'

export function addGround(g: THREE.Group, kind: GroundKind, r = 12): void {
  if (kind === 'none') return
  const colors: Record<string, number> = {
    stone: PALETTE.stone,
    sand: PALETTE.sand,
    grass: PALETTE.grass,
    earth: PALETTE.earth,
    snow: 0xf4f0e8,
  }
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 1.04, 0.35, 48),
    soft(colors[kind] ?? PALETTE.stone, 0.95)
  )
  disc.position.y = -0.18
  disc.receiveShadow = true
  g.add(disc)
}

export function addPaving(
  g: THREE.Group,
  r: number,
  color = PALETTE.marble,
  y = 0.02
): void {
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 40), soft(color, 0.9))
  disc.rotation.x = -Math.PI / 2
  disc.position.y = y
  disc.receiveShadow = true
  g.add(disc)
}

// ── 水体 ─────────────────────────────────

export function addRiver(
  g: THREE.Group,
  width: number,
  length: number,
  x = 0,
  z = 0,
  rotY = 0
): void {
  const w = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    mat(PALETTE.water, {
      transparent: true,
      opacity: 0.72,
      roughness: 0.25,
      metalness: 0.15,
    })
  )
  w.rotation.x = -Math.PI / 2
  w.rotation.z = rotY
  w.position.set(x, 0.06, z)
  w.receiveShadow = true
  g.add(w)
  // 岸线
  const bank = new THREE.Mesh(
    new THREE.PlaneGeometry(width + 1.2, length + 1.2),
    soft(PALETTE.stone, 0.4)
  )
  bank.rotation.x = -Math.PI / 2
  bank.rotation.z = rotY
  bank.position.set(x, 0.02, z)
  g.add(bank)
}

export function addLake(g: THREE.Group, r: number, x = 0, z = 0): void {
  const w = new THREE.Mesh(
    new THREE.CircleGeometry(r, 40),
    mat(PALETTE.waterDeep, {
      transparent: true,
      opacity: 0.68,
      roughness: 0.22,
      metalness: 0.12,
    })
  )
  w.rotation.x = -Math.PI / 2
  w.position.set(x, 0.07, z)
  g.add(w)
}

export function addCanals(g: THREE.Group, span: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1) - 0.5) * span
    addRiver(g, 0.7, span, t, 0)
    addRiver(g, 0.7, span, 0, t, Math.PI / 2)
  }
}

// ── 建筑 ─────────────────────────────────

export function addHouse(
  g: THREE.Group,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  z: number,
  ry = 0
): THREE.Group {
  const house = new THREE.Group()
  box(house, w, h, d, color, 0, h / 2, 0)
  // 屋顶
  box(house, w * 1.12, 0.18, d * 1.12, PALETTE.rust, 0, h + 0.09, 0)
  // 门窗
  box(house, w * 0.18, h * 0.45, 0.08, PALETTE.ink, 0, h * 0.22, d / 2 + 0.02)
  box(house, w * 0.22, h * 0.22, 0.06, PALETTE.glass, w * 0.28, h * 0.55, d / 2 + 0.02)
  box(house, w * 0.22, h * 0.22, 0.06, PALETTE.glass, -w * 0.28, h * 0.55, d / 2 + 0.02)
  house.position.set(x, 0, z)
  house.rotation.y = ry
  g.add(house)
  return house
}

export function addDome(
  g: THREE.Group,
  r: number,
  h: number,
  color: number,
  x: number,
  z: number
): THREE.Group {
  const t = new THREE.Group()
  cyl(t, r, r * 1.08, h, color, 0, h / 2, 0, 16)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(r * 1.05, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), soft(color, 0.9))
  dome.position.y = h
  dome.castShadow = true
  t.add(dome)
  // 顶饰
  sphere(t, r * 0.18, PALETTE.gold, 0, h + r * 1.1, 0)
  t.position.set(x, 0, z)
  g.add(t)
  return t
}

export function addTower(
  g: THREE.Group,
  r: number,
  h: number,
  color: number,
  x: number,
  z: number
): THREE.Group {
  const t = new THREE.Group()
  cyl(t, r, r * 1.12, h, color, 0, h / 2, 0, 12)
  // 檐口
  cyl(t, r * 1.25, r * 1.25, 0.22, PALETTE.wood, 0, h * 0.72, 0, 12)
  cyl(t, r * 1.15, r * 0.35, h * 0.18, PALETTE.rust, 0, h + h * 0.08, 0, 12)
  t.position.set(x, 0, z)
  g.add(t)
  return t
}

export function addGlassVilla(
  g: THREE.Group,
  w: number,
  h: number,
  d: number,
  x: number,
  z: number,
  ry = 0
): THREE.Group {
  const v = new THREE.Group()
  box(v, w, h, d, PALETTE.glass, 0, h / 2, 0, 0, {
    transparent: true,
    opacity: 0.42,
    roughness: 0.15,
    metalness: 0.2,
    flatShading: false,
  })
  // 框架
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      cyl(v, 0.08, 0.08, h, PALETTE.gold, sx * w * 0.48, h / 2, sz * d * 0.48, 6)
    }
  }
  box(v, w * 1.06, 0.12, d * 1.06, PALETTE.gold, 0, h + 0.06, 0)
  v.position.set(x, 0, z)
  v.rotation.y = ry
  g.add(v)
  return v
}

export function addColumn(
  g: THREE.Group,
  r: number,
  h: number,
  color: number,
  x: number,
  y: number,
  z: number
): THREE.Mesh {
  const c = cyl(g, r, r * 1.05, h, color, x, y + h / 2, z, 12)
  cyl(g, r * 1.3, r * 1.3, 0.16, PALETTE.gold, x, y + 0.08, z, 12)
  cyl(g, r * 1.3, r * 1.3, 0.16, PALETTE.gold, x, y + h - 0.08, z, 12)
  return c
}

export function addArch(
  g: THREE.Group,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
  ry = 0
): void {
  box(g, 0.35, h, d, color, x - w / 2, y + h / 2, z, ry)
  box(g, 0.35, h, d, color, x + w / 2, y + h / 2, z, ry)
  box(g, w + 0.35, 0.3, d, color, x, y + h, z, ry)
}

export function addScaffold(
  g: THREE.Group,
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number
): void {
  const m = mat(PALETTE.wood, { transparent: true, opacity: 0.8 })
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.1, h, 0.1), m)
      pole.position.set(x + sx * w / 2, y + h / 2, z + sz * d / 2)
      g.add(pole)
    }
  }
  for (let i = 1; i <= 3; i++) {
    const yy = y + (h * i) / 4
    for (const sz of [-1, 1]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.08), m)
      bar.position.set(x, yy, z + sz * d / 2)
      g.add(bar)
    }
    for (const sx of [-1, 1]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, d), m)
      bar.position.set(x + sx * w / 2, yy, z)
      g.add(bar)
    }
  }
}

// ── 人物 ─────────────────────────────────

export function addPerson(
  g: THREE.Group,
  x: number,
  z: number,
  ry = 0,
  color = PALETTE.cloth,
  scale = 1
): THREE.Group {
  const p = new THREE.Group()
  // 腿
  cyl(p, 0.08, 0.1, 0.55, color, -0.1, 0.28, 0, 6)
  cyl(p, 0.08, 0.1, 0.55, color, 0.1, 0.28, 0, 6)
  // 躯干
  box(p, 0.38, 0.55, 0.22, color, 0, 0.85, 0)
  // 手臂
  cyl(p, 0.06, 0.06, 0.5, color, -0.26, 0.82, 0, 6)
  cyl(p, 0.06, 0.06, 0.5, color, 0.26, 0.82, 0, 6)
  // 头
  sphere(p, 0.16, PALETTE.skin, 0, 1.32, 0)
  p.position.set(x, 0, z)
  p.rotation.y = ry
  p.scale.setScalar(scale)
  g.add(p)
  return p
}

export function addCrowd(
  g: THREE.Group,
  count: number,
  radius: number,
  rng: Rng,
  center = new THREE.Vector3()
): void {
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2
    const r = 0.6 + rng() * radius
    const colors = [PALETTE.cloth, PALETTE.vermilion, PALETTE.slate, PALETTE.wood, PALETTE.ink]
    addPerson(
      g,
      center.x + Math.cos(a) * r,
      center.z + Math.sin(a) * r,
      rng() * Math.PI * 2,
      colors[i % colors.length],
      0.85 + rng() * 0.3
    )
  }
}

// ── 植物 / 装饰 ──────────────────────────

export function addTree(g: THREE.Group, x: number, z: number, h = 2.2): void {
  cyl(g, 0.12, 0.16, h * 0.55, PALETTE.wood, x, h * 0.28, z, 7)
  sphere(g, h * 0.38, PALETTE.leaf, x, h * 0.72, z)
  sphere(g, h * 0.28, PALETTE.leaf, x + 0.2, h * 0.92, z - 0.15)
}

export function addPalm(g: THREE.Group, x: number, z: number, h = 3): void {
  const trunk = cyl(g, 0.12, 0.18, h, PALETTE.wood, x, h / 2, z, 7)
  trunk.rotation.z = 0.12
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const leaf = box(g, 1.4, 0.08, 0.35, PALETTE.leaf, x + Math.cos(a) * 0.7, h, z + Math.sin(a) * 0.7, a)
    leaf.rotation.z = -0.35
  }
}

export function addLamp(
  g: THREE.Group,
  x: number,
  y: number,
  z: number,
  color = PALETTE.gold
): void {
  cyl(g, 0.05, 0.06, 1.6, PALETTE.ink, x, y + 0.8, z, 6)
  sphere(g, 0.14, color, x, y + 1.7, z, {
    emissive: color,
    emissiveIntensity: 0.55,
    roughness: 0.4,
  })
}

export function addStringNet(
  g: THREE.Group,
  from: THREE.Vector3,
  to: THREE.Vector3,
  color: number,
  opacity = 0.45
): void {
  line(g, [from, to], color, opacity)
}

export function addWaterfall(
  g: THREE.Group,
  x: number,
  yTop: number,
  yBot: number,
  z: number
): void {
  const w = new THREE.Mesh(
    new THREE.PlaneGeometry(0.45, yTop - yBot),
    mat(PALETTE.water, {
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      side: THREE.DoubleSide,
      flatShading: false,
    })
  )
  w.position.set(x, (yTop + yBot) / 2, z)
  g.add(w)
  // 水花
  for (let i = 0; i < 5; i++) {
    sphere(g, 0.08, PALETTE.glass, x + (Math.random() - 0.5) * 0.3, yBot + 0.1, z + (Math.random() - 0.5) * 0.2, {
      transparent: true,
      opacity: 0.55,
    })
  }
}

// ── 光影 ─────────────────────────────────

export function addSunLight(g: THREE.Group): void {
  const sun = new THREE.DirectionalLight(0xffe8c8, 1.15)
  sun.position.set(12, 18, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 50
  sun.shadow.camera.left = -16
  sun.shadow.camera.right = 16
  sun.shadow.camera.top = 16
  sun.shadow.camera.bottom = -16
  g.add(sun)

  const hemi = new THREE.HemisphereLight(0xfff2e0, 0xc8b898, 0.75)
  g.add(hemi)

  const fill = new THREE.DirectionalLight(0xb8c8d8, 0.35)
  fill.position.set(-10, 8, -8)
  g.add(fill)
}

export function addGlow(
  g: THREE.Group,
  x: number,
  y: number,
  z: number,
  color: number,
  intensity = 0.8,
  distance = 8
): void {
  const l = new THREE.PointLight(color, intensity, distance, 2)
  l.position.set(x, y, z)
  g.add(l)
  // 灯芯球
  sphere(g, 0.12, color, x, y, z, {
    emissive: color,
    emissiveIntensity: 0.8,
  })
}

export function addParticles(
  g: THREE.Group,
  count: number,
  spread: number,
  yRange: [number, number],
  color: number,
  size = 0.08,
  rng: Rng
): void {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rng() - 0.5) * spread * 2
    pos[i * 3 + 1] = yRange[0] + rng() * (yRange[1] - yRange[0])
    pos[i * 3 + 2] = (rng() - 0.5) * spread * 2
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.add(
    new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
    )
  )
}

export function addShadowDisc(g: THREE.Group, r: number, x = 0, z = 0, opacity = 0.12): void {
  const s = new THREE.Mesh(
    new THREE.CircleGeometry(r, 32),
    new THREE.MeshBasicMaterial({
      color: PALETTE.ink,
      transparent: true,
      opacity,
      depthWrite: false,
    })
  )
  s.rotation.x = -Math.PI / 2
  s.position.set(x, 0.02, z)
  g.add(s)
}
