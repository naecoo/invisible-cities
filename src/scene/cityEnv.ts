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
  straw: 0xd4c09a,
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

/** 流动水体着色器 — 波纹 + 微光 */
export function makeWaterMaterial(color = PALETTE.water, opacity = 0.72): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorld;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vWorld;
      void main() {
        // 双层波纹
        float w1 = sin(vWorld.x * 2.2 + uTime * 1.1) * 0.5 + 0.5;
        float w2 = sin(vWorld.z * 2.8 - uTime * 0.9 + vWorld.x * 0.6) * 0.5 + 0.5;
        float w3 = sin((vWorld.x + vWorld.z) * 1.4 + uTime * 0.55) * 0.5 + 0.5;
        float wave = w1 * 0.4 + w2 * 0.35 + w3 * 0.25;
        vec3 col = uColor * (0.78 + wave * 0.38);
        // 高光
        float spec = pow(wave, 6.0) * 0.35;
        col += vec3(spec);
        float a = uOpacity * (0.82 + wave * 0.18);
        gl_FragColor = vec4(col, a);
      }
    `,
  })
}

// 需要在渲染循环中更新时间的水面
const waterMats: THREE.ShaderMaterial[] = []
export function tickWater(t: number): void {
  for (const m of waterMats) m.uniforms.uTime.value = t
}

export function addRiver(
  g: THREE.Group,
  width: number,
  length: number,
  x = 0,
  z = 0,
  rotY = 0
): void {
  const w = new THREE.Mesh(new THREE.PlaneGeometry(width, length, 12, 12), makeWaterMaterial())
  waterMats.push(w.material as THREE.ShaderMaterial)
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
  // 岸边卵石
  for (let i = 0; i < 6; i++) {
    const t = (i / 5 - 0.5) * length * 0.85
    sphere(g, 0.12 + (i % 3) * 0.04, PALETTE.slate, x + width * 0.55, 0.08, z + t)
    sphere(g, 0.1, PALETTE.slate, x - width * 0.55, 0.08, z + t * 0.9)
  }
}

export function addLake(g: THREE.Group, r: number, x = 0, z = 0): void {
  const w = new THREE.Mesh(new THREE.CircleGeometry(r, 48), makeWaterMaterial(PALETTE.waterDeep, 0.7))
  waterMats.push(w.material as THREE.ShaderMaterial)
  w.rotation.x = -Math.PI / 2
  w.position.set(x, 0.07, z)
  g.add(w)
  // 波纹环
  for (let i = 1; i <= 3; i++) {
    torus(g, r * 0.35 * i, 0.035, PALETTE.glass, x, 0.09, z, Math.PI / 2, {
      transparent: true,
      opacity: 0.35 - i * 0.08,
    })
  }
}

export function addCanals(g: THREE.Group, span: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1) - 0.5) * span
    addRiver(g, 0.7, span, t, 0)
    addRiver(g, 0.7, span, 0, t, Math.PI / 2)
  }
  // 桥梁
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1) - 0.5) * span
    box(g, 1.2, 0.12, 0.55, PALETTE.wood, t, 0.22, 0)
    box(g, 0.55, 0.12, 1.2, PALETTE.wood, 0, 0.22, t)
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

export type PersonPose = 'stand' | 'walk' | 'sit' | 'bath' | 'carry' | 'gesture' | 'look'

export interface PersonOpts {
  pose?: PersonPose
  robe?: number
  hair?: number
  skin?: number
  accessory?: 'none' | 'hat' | 'basket' | 'staff' | 'towel' | 'fan'
}

/**
 * 细模人物：发型 / 长袍 / 姿态 / 手持物
 */
export function addPerson(
  g: THREE.Group,
  x: number,
  z: number,
  ry = 0,
  color = PALETTE.cloth,
  scale = 1,
  opts: PersonOpts = {}
): THREE.Group {
  const pose = opts.pose ?? 'stand'
  const robe = opts.robe ?? color
  const hair = opts.hair ?? PALETTE.ink
  const skin = opts.skin ?? PALETTE.skin
  const acc = opts.accessory ?? 'none'

  const p = new THREE.Group()
  const legSwing = pose === 'walk' ? 0.35 : 0
  const armSwing = pose === 'walk' ? 0.4 : 0
  const sitDrop = pose === 'sit' ? -0.22 : 0

  // 腿（裤/袍下摆）
  if (pose === 'bath') {
    // 浴姿：坐入水中，只见上身
    box(p, 0.42, 0.35, 0.28, skin, 0, 0.2, 0)
    cyl(p, 0.14, 0.16, 0.5, robe, 0, 0.55, 0, 8)
  } else {
    cyl(p, 0.075, 0.095, 0.52, robe, -0.11, 0.26 + sitDrop, legSwing * 0.2, 7)
    cyl(p, 0.075, 0.095, 0.52, robe, 0.11, 0.26 + sitDrop, -legSwing * 0.2, 7)
    // 鞋
    box(p, 0.11, 0.07, 0.2, PALETTE.ink, -0.11, 0.04 + sitDrop, 0.04)
    box(p, 0.11, 0.07, 0.2, PALETTE.ink, 0.11, 0.04 + sitDrop, -0.02)
  }

  // 长袍 / 上身
  const torsoY = 0.82 + sitDrop
  if (pose === 'bath') {
    sphere(p, 0.22, skin, 0, 0.72, 0)
    box(p, 0.36, 0.28, 0.2, skin, 0, 0.95, 0)
  } else {
    // 袍身（略宽下摆）
    cyl(p, 0.19, 0.24, 0.62, robe, 0, torsoY, 0, 8)
    // 束带
    cyl(p, 0.2, 0.2, 0.06, PALETTE.gold, 0, torsoY + 0.05, 0, 8)
    // 肩
    box(p, 0.42, 0.16, 0.22, robe, 0, torsoY + 0.3, 0)
  }

  // 手臂
  const armY = torsoY + 0.22
  if (pose === 'gesture') {
    cyl(p, 0.055, 0.06, 0.48, robe, -0.28, armY + 0.12, 0.18, 7).rotation.x = -0.9
    cyl(p, 0.055, 0.06, 0.48, robe, 0.28, armY + 0.18, 0.28, 7).rotation.x = -1.3
  } else if (pose === 'carry') {
    cyl(p, 0.055, 0.06, 0.5, robe, -0.28, armY, 0.12, 7).rotation.x = -0.5
    cyl(p, 0.055, 0.06, 0.5, robe, 0.28, armY, 0.12, 7).rotation.x = -0.5
  } else if (pose === 'bath') {
    cyl(p, 0.05, 0.055, 0.42, skin, -0.26, 0.95, 0.1, 7).rotation.x = -0.7
    cyl(p, 0.05, 0.055, 0.42, skin, 0.26, 0.95, 0.1, 7).rotation.x = -0.7
  } else if (pose === 'look') {
    cyl(p, 0.055, 0.06, 0.48, robe, -0.28, armY + 0.1, 0.22, 7).rotation.x = -1.1
    cyl(p, 0.055, 0.06, 0.48, robe, 0.28, armY, -0.05, 7)
  } else {
    cyl(p, 0.055, 0.06, 0.5, robe, -0.28, armY, armSwing * 0.3, 7).rotation.x = armSwing
    cyl(p, 0.055, 0.06, 0.5, robe, 0.28, armY, -armSwing * 0.3, 7).rotation.x = -armSwing
  }
  // 手
  sphere(p, 0.07, skin, -0.32, armY - 0.22, 0.1)
  sphere(p, 0.07, skin, 0.32, armY - 0.22, 0.1)

  // 头
  const headY = torsoY + 0.58
  sphere(p, 0.17, skin, 0, headY, 0)
  // 发
  if (pose === 'bath') {
    // 湿发披下
    box(p, 0.28, 0.35, 0.12, hair, 0, headY - 0.12, -0.1)
    sphere(p, 0.16, hair, 0, headY + 0.06, -0.04)
  } else {
    sphere(p, 0.175, hair, 0, headY + 0.07, -0.03)
    // 发髻
    sphere(p, 0.09, hair, 0, headY + 0.18, -0.08)
  }
  // 五官暗示
  sphere(p, 0.025, PALETTE.ink, -0.06, headY + 0.02, 0.15)
  sphere(p, 0.025, PALETTE.ink, 0.06, headY + 0.02, 0.15)

  // 配饰
  if (acc === 'hat') {
    cyl(p, 0.22, 0.12, 0.12, PALETTE.straw, 0, headY + 0.2, 0, 10)
  } else if (acc === 'basket') {
    cyl(p, 0.14, 0.16, 0.18, PALETTE.wood, 0.32, armY - 0.15, 0.18, 10)
  } else if (acc === 'staff') {
    cyl(p, 0.025, 0.03, 1.1, PALETTE.wood, -0.32, 0.55, 0.15, 6)
  } else if (acc === 'towel') {
    box(p, 0.18, 0.22, 0.05, PALETTE.marble, 0.3, armY - 0.1, 0.2)
  } else if (acc === 'fan') {
    box(p, 0.16, 0.22, 0.02, PALETTE.gold, 0.34, armY - 0.05, 0.22)
  }

  p.position.set(x, 0, z)
  p.rotation.y = ry
  p.scale.setScalar(scale)
  // 阴影
  const sh = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 12),
    new THREE.MeshBasicMaterial({ color: PALETTE.ink, transparent: true, opacity: 0.1, depthWrite: false })
  )
  sh.rotation.x = -Math.PI / 2
  sh.position.y = 0.015
  p.add(sh)
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
  const poses: PersonPose[] = ['stand', 'walk', 'gesture', 'look', 'carry']
  const accs: Array<PersonOpts['accessory']> = ['none', 'hat', 'basket', 'staff', 'fan']
  const colors = [PALETTE.cloth, PALETTE.vermilion, PALETTE.slate, PALETTE.wood, PALETTE.ink, PALETTE.gold]
  for (let i = 0; i < count; i++) {
    const a = rng() * Math.PI * 2
    const r = 0.6 + rng() * radius
    addPerson(
      g,
      center.x + Math.cos(a) * r,
      center.z + Math.sin(a) * r,
      rng() * Math.PI * 2,
      colors[i % colors.length],
      0.88 + rng() * 0.22,
      {
        pose: poses[i % poses.length],
        hair: rng() > 0.5 ? PALETTE.ink : PALETTE.wood,
        accessory: accs[i % accs.length],
      }
    )
  }
}

/** 浴场人群 — 阿尔米拉等 */
export function addBathers(
  g: THREE.Group,
  count: number,
  radius: number,
  rng: Rng
): void {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rng() * 0.4
    const r = 1.5 + rng() * radius
    addPerson(
      g,
      Math.cos(a) * r,
      Math.sin(a) * r,
      a + Math.PI / 2,
      PALETTE.skin,
      0.9 + rng() * 0.15,
      { pose: 'bath', hair: rng() > 0.4 ? PALETTE.wood : PALETTE.ink, accessory: 'towel' }
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
  const matFall = makeWaterMaterial(PALETTE.water, 0.58)
  matFall.side = THREE.DoubleSide
  waterMats.push(matFall)
  const w = new THREE.Mesh(new THREE.PlaneGeometry(0.5, yTop - yBot, 4, 12), matFall)
  w.position.set(x, (yTop + yBot) / 2, z)
  g.add(w)
  // 水雾
  for (let i = 0; i < 8; i++) {
    sphere(g, 0.07 + Math.random() * 0.06, PALETTE.glass, x + (Math.random() - 0.5) * 0.4, yBot + 0.08, z + (Math.random() - 0.5) * 0.3, {
      transparent: true,
      opacity: 0.5,
    })
  }
  // 底部水潭
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.55, 20), makeWaterMaterial(PALETTE.water, 0.55))
  waterMats.push(pool.material as THREE.ShaderMaterial)
  pool.rotation.x = -Math.PI / 2
  pool.position.set(x, yBot + 0.04, z)
  g.add(pool)
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


// ── 城市符号细节 ─────────────────────────

export function addCoralColumn(g: THREE.Group, x: number, z: number, h = 3): void {
  cyl(g, 0.16, 0.2, h, PALETTE.vermilion, x, h / 2, z, 8)
  cyl(g, 0.28, 0.28, 0.12, PALETTE.gold, x, 0.08, z, 10)
  cyl(g, 0.28, 0.28, 0.12, PALETTE.gold, x, h - 0.08, z, 10)
  // 珊瑚饰
  for (let i = 0; i < 3; i++) {
    sphere(g, 0.12, PALETTE.vermilion, x + (Math.random() - 0.5) * 0.15, h * (0.3 + i * 0.25), z + 0.12)
  }
}

export function addAquariumVilla(g: THREE.Group, x: number, z: number, ry = 0): void {
  // 玻璃水族馆
  box(g, 1.6, 1.5, 1.2, PALETTE.glass, x, 0.75, z, ry, {
    transparent: true,
    opacity: 0.38,
    roughness: 0.12,
    metalness: 0.18,
    flatShading: false,
  })
  // 内部水面
  box(g, 1.4, 0.5, 1, PALETTE.water, x, 0.4, z, ry, {
    transparent: true,
    opacity: 0.45,
    roughness: 0.2,
    flatShading: false,
  })
  // 舞者剪影
  addPerson(g, x, z, ry + 0.6, PALETTE.gold, 0.7, { pose: 'gesture' })
  // 水母灯
  sphere(g, 0.18, PALETTE.glass, x, 1.35, z, {
    transparent: true,
    opacity: 0.6,
    emissive: PALETTE.glass,
    emissiveIntensity: 0.35,
  })
  addGlow(g, x, 1.35, z, PALETTE.glass, 0.35, 3)
}

export function addTrashPile(g: THREE.Group, x: number, z: number, rng: Rng): void {
  for (let i = 0; i < 6; i++) {
    box(
      g,
      0.35 + rng() * 0.5,
      0.25 + rng() * 0.45,
      0.35 + rng() * 0.4,
      [PALETTE.rust, PALETTE.wood, PALETTE.slate, PALETTE.vermilion][i % 4],
      x + (rng() - 0.5) * 1.2,
      0.2 + rng() * 0.3,
      z + (rng() - 0.5) * 1.2,
      rng() * Math.PI
    )
  }
}

export function addStarField(g: THREE.Group, count: number, rng: Rng): void {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rng() - 0.5) * 22
    pos[i * 3 + 1] = 7 + rng() * 10
    pos[i * 3 + 2] = (rng() - 0.5) * 22
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.add(
    new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: PALETTE.gold,
        size: 0.12,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        sizeAttenuation: true,
      })
    )
  )
}

export function addStringWeb(
  g: THREE.Group,
  posts: Array<{ x: number; y: number; z: number }>,
  color: number
): void {
  for (let i = 0; i < posts.length; i++) {
    const a = posts[i]
    for (let j = i + 1; j < posts.length; j++) {
      if ((i + j) % 3 !== 0) continue
      const b = posts[j]
      line(
        g,
        [new THREE.Vector3(a.x, a.y, a.z), new THREE.Vector3(b.x, b.y, b.z)],
        color,
        0.32
      )
    }
    // 立柱
    cyl(g, 0.06, 0.06, a.y, PALETTE.wood, a.x, a.y / 2, a.z, 6)
  }
}

export function addReflectionDisc(g: THREE.Group, r: number, x: number, z: number): void {
  const d = new THREE.Mesh(
    new THREE.CircleGeometry(r, 32),
    new THREE.MeshBasicMaterial({
      color: PALETTE.waterDeep,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    })
  )
  d.rotation.x = -Math.PI / 2
  d.position.set(x, 0.03, z)
  g.add(d)
}


// ── 更多城市意象件 ───────────────────────

export function addBanner(g: THREE.Group, x: number, y: number, z: number, color: number, ry = 0): void {
  cyl(g, 0.035, 0.035, 1.8, PALETTE.wood, x, y + 0.9, z, 5)
  box(g, 0.55, 1.05, 0.03, color, x + 0.02, y + 1.1, z, ry, {
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
  })
}

export function addMarketStall(g: THREE.Group, x: number, z: number, ry: number, color: number): void {
  const s = new THREE.Group()
  box(s, 1.15, 0.75, 0.85, PALETTE.wood, 0, 0.38, 0)
  box(s, 1.35, 0.1, 1.05, color, 0, 0.82, 0)
  // 货品
  for (let i = 0; i < 4; i++) {
    sphere(s, 0.12, [PALETTE.vermilion, PALETTE.gold, PALETTE.leaf, PALETTE.glass][i], -0.35 + i * 0.22, 0.95, 0.12)
  }
  // 遮阳棚
  box(s, 1.4, 0.05, 1.1, color, 0, 1.55, 0)
  cyl(s, 0.035, 0.035, 1.55, PALETTE.wood, -0.55, 0.78, -0.4, 5)
  cyl(s, 0.035, 0.035, 1.55, PALETTE.wood, 0.55, 0.78, -0.4, 5)
  s.position.set(x, 0, z)
  s.rotation.y = ry
  g.add(s)
}

export function addBoat(g: THREE.Group, x: number, z: number, ry = 0, color = PALETTE.wood): void {
  const b = new THREE.Group()
  box(b, 1.15, 0.22, 0.42, color, 0, 0.14, 0)
  box(b, 0.95, 0.12, 0.32, PALETTE.ink, 0, 0.26, 0)
  // 船桨
  cyl(b, 0.025, 0.025, 0.9, PALETTE.wood, 0.25, 0.35, 0.35, 5).rotation.z = 0.7
  b.position.set(x, 0, z)
  b.rotation.y = ry
  g.add(b)
}

export function addWell(g: THREE.Group, x: number, z: number): void {
  cyl(g, 0.42, 0.48, 0.7, PALETTE.stone, x, 0.35, z, 14)
  cyl(g, 0.32, 0.32, 0.75, PALETTE.ink, x, 0.32, z, 14)
  sphere(g, 0.28, PALETTE.waterDeep, x, 0.45, z, { transparent: true, opacity: 0.7 })
  // 辘轳
  box(g, 0.08, 1.1, 0.08, PALETTE.wood, x - 0.35, 0.85, z)
  box(g, 0.08, 1.1, 0.08, PALETTE.wood, x + 0.35, 0.85, z)
  box(g, 0.85, 0.08, 0.08, PALETTE.wood, x, 1.35, z)
}

export function addStoneTablet(g: THREE.Group, x: number, y: number, z: number, ry = 0, h = 1.8): void {
  box(g, 0.85, h, 0.22, PALETTE.stone, x, y + h / 2, z, ry)
  // 刻痕
  for (let i = 0; i < 4; i++) {
    box(g, 0.55, 0.07, 0.03, PALETTE.ink, x, y + 0.35 + i * 0.35, z + 0.13, ry)
  }
  box(g, 1.05, 0.14, 0.32, PALETTE.stone, x, y + 0.07, z, ry)
}

export function addIncense(g: THREE.Group, x: number, y: number, z: number): void {
  cyl(g, 0.18, 0.22, 0.22, PALETTE.rust, x, y + 0.11, z, 10)
  for (let i = 0; i < 3; i++) {
    cyl(g, 0.018, 0.018, 0.75, PALETTE.wood, x + (i - 1) * 0.08, y + 0.55, z, 5)
    // 烟
    sphere(g, 0.1, PALETTE.marble, x + (i - 1) * 0.12, y + 1.05, z, {
      transparent: true,
      opacity: 0.22,
    })
  }
}

export function addConstellationRing(g: THREE.Group, r: number, y: number, color: number): void {
  torus(g, r, 0.06, color, 0, y, 0, Math.PI / 2, {
    transparent: true,
    opacity: 0.55,
    emissive: color,
    emissiveIntensity: 0.25,
  })
}

export function addRuinBlock(g: THREE.Group, x: number, z: number, rng: Rng): void {
  const w = 0.6 + rng() * 1.1
  const h = 0.4 + rng() * 1.2
  box(g, w, h, 0.45 + rng() * 0.4, PALETTE.earth, x, h / 2, z, rng() * Math.PI, {
    roughness: 0.95,
    flatShading: true,
  })
}
