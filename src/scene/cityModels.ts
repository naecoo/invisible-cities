import * as THREE from 'three'

/**
 * 55 城独立几何生成器 — 贴合原著意象
 * 每座城返回一个 THREE.Group，单位尺度约 10×10×10
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

const C = {
  paper: 0xe8dcc8,
  stone: 0xd4c8b8,
  ink: 0x2a2420,
  vermilion: 0xc45c3e,
  gold: 0xc4a574,
  slate: 0x7a8a92,
  mist: 0xd8d0c4,
  deep: 0x8a7a6a,
}

function mat(color: number, opacity = 0.88): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    roughness: 0.86,
    metalness: 0.03,
    flatShading: true,
  })
}

function box(
  g: THREE.Group,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
  ry = 0
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color))
  m.position.set(x, y, z)
  m.rotation.y = ry
  g.add(m)
  return m
}

function cyl(
  g: THREE.Group,
  r1: number,
  r2: number,
  h: number,
  color: number,
  x: number,
  y: number,
  z: number,
  seg = 12
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat(color))
  m.position.set(x, y, z)
  g.add(m)
  return m
}

function sphere(
  g: THREE.Group,
  r: number,
  color: number,
  x: number,
  y: number,
  z: number
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat(color, 0.82))
  m.position.set(x, y, z)
  g.add(m)
  return m
}

function torus(
  g: THREE.Group,
  r: number,
  t: number,
  color: number,
  x: number,
  y: number,
  z: number,
  rx = Math.PI / 2
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 32), mat(color, 0.75))
  m.position.set(x, y, z)
  m.rotation.x = rx
  g.add(m)
  return m
}

function line(
  g: THREE.Group,
  points: THREE.Vector3[],
  color: number,
  opacity = 0.4
): void {
  const geo = new THREE.BufferGeometry().setFromPoints(points)
  g.add(
    new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    )
  )
}

function ringPlatform(g: THREE.Group, r: number, y: number, color: number): void {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, 0.25, 32), mat(color, 0.8))
  m.position.y = y
  g.add(m)
}

// ─────────────────────────────────────────
// 城市与记忆
// ─────────────────────────────────────────

/** 迪奥米拉：黄昏银顶、林荫道、预感中的象队 */
function diomira(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 银色穹顶群
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    const r = 2.2 + _rng() * 1.8
    const h = 1.4 + _rng() * 1.6
    cyl(g, 0.7, 0.9, h, C.stone, Math.cos(a) * r, h / 2, Math.sin(a) * r)
    sphere(g, 0.85, C.mist, Math.cos(a) * r, h + 0.3, Math.sin(a) * r)
  }
  // 林荫道
  for (let i = 0; i < 10; i++) {
    const z = -4 + i * 0.9
    box(g, 0.18, 2.2, 0.18, C.deep, -3.2, 1.1, z)
    box(g, 0.18, 2.2, 0.18, C.deep, 3.2, 1.1, z)
    box(g, 0.9, 0.15, 0.15, C.gold, -3.2, 2.2, z)
    box(g, 0.9, 0.15, 0.15, C.gold, 3.2, 2.2, z)
  }
  // 中央大道
  box(g, 2.2, 0.12, 10, C.paper, 0, 0.06, 0)
  // 远处象队剪影
  for (let i = 0; i < 4; i++) {
    box(g, 1.1, 0.9, 0.55, C.vermilion, -1.5 + i * 1.1, 0.55, 4.2 + _rng() * 0.4)
    box(g, 0.35, 0.7, 0.35, C.vermilion, -1.5 + i * 1.1, 1.2, 4.2)
  }
  return g
}

/** 伊西多拉：山城、螺旋楼梯、回忆之井 */
function isidora(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 山体
  const hill = new THREE.Mesh(new THREE.ConeGeometry(5, 4, 8), mat(C.stone, 0.85))
  hill.position.y = 2
  g.add(hill)
  // 螺旋上升的阶梯
  for (let i = 0; i < 24; i++) {
    const t = i / 24
    const a = t * Math.PI * 4
    const r = 3.2 - t * 2.2
    box(g, 0.7, 0.12, 0.35, C.paper, Math.cos(a) * r, 0.5 + t * 3.4, Math.sin(a) * r, a)
  }
  // 顶部小城
  cyl(g, 1.1, 1.3, 1.2, C.mist, 0, 4.2, 0)
  sphere(g, 0.55, C.vermilion, 0, 5.1, 0)
  // 井
  cyl(g, 0.45, 0.45, 1.2, C.ink, 2.4, 0.6, 1.4)
  return g
}

/** 扎伊拉：层叠纸页、铁丝网、压紧的过去 */
function zaira(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 层叠「纸页」
  for (let i = 0; i < 12; i++) {
    const s = 6.5 - i * 0.28
    box(g, s, 0.12, s * 0.75, i % 3 === 0 ? C.gold : C.paper, 0, i * 0.32, 0, i * 0.08)
  }
  // 铁丝
  for (let i = 0; i < 8; i++) {
    line(
      g,
      [
        new THREE.Vector3(-4, 0.2 + i * 0.4, -3 + i * 0.8),
        new THREE.Vector3(4, 0.2 + i * 0.4, -3 + i * 0.8),
      ],
      C.ink,
      0.3
    )
  }
  // 突出的砖块
  for (let i = 0; i < 10; i++) {
    box(
      g,
      0.55,
      0.35,
      0.35,
      C.vermilion,
      (_rng() - 0.5) * 5,
      0.5 + _rng() * 3,
      (_rng() - 0.5) * 4
    )
  }
  return g
}

/** 佐拉：按记忆排列的城、无法遗忘的同心结构 */
function zora(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 同心环带
  for (let i = 0; i < 6; i++) {
    torus(g, 1.2 + i * 0.95, 0.12, i === 2 ? C.vermilion : C.stone, 0, 0.4 + i * 0.55, 0)
  }
  // 径向街
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    line(
      g,
      [new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(Math.cos(a) * 5.5, 0.2, Math.sin(a) * 5.5)],
      C.ink,
      0.25
    )
  }
  // 中心塔
  cyl(g, 0.5, 0.85, 5.5, C.paper, 0, 2.75, 0)
  sphere(g, 0.55, C.gold, 0, 5.8, 0)
  // 环上小屋
  for (let i = 0; i < 18; i++) {
    const a = _rng() * Math.PI * 2
    const r = 1.5 + _rng() * 4
    box(g, 0.5, 0.6 + _rng(), 0.5, C.mist, Math.cos(a) * r, 0.5, Math.sin(a) * r, a)
  }
  return g
}

/** 莫里利亚：旧明信片、并置的过去与现在 */
function maurilia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 左：旧城（倾斜明信片感）
  for (let i = 0; i < 6; i++) {
    box(g, 1.2, 0.15, 1.8, C.deep, -3.2, 0.4 + i * 0.7, (_rng() - 0.5) * 2, 0.15)
  }
  // 右：新城
  for (let i = 0; i < 6; i++) {
    const h = 1 + _rng() * 2.4
    box(g, 1.1, h, 1.1, C.paper, 3.2, h / 2, (_rng() - 0.5) * 2.5)
    sphere(g, 0.35, C.gold, 3.2, h + 0.3, (_rng() - 0.5) * 2.5)
  }
  // 中间桥
  box(g, 3.2, 0.15, 0.7, C.vermilion, 0, 2.2, 0)
  // 相框
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 0.08), mat(C.gold, 0.5))
  frame.position.set(0, 1.6, -3)
  g.add(frame)
  return g
}

// ─────────────────────────────────────────
// 城市与欲望
// ─────────────────────────────────────────

/** 多萝泰亚：欲望前后两座城 */
function dorotea(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 左：抵达前（精细、对称）
  for (let i = 0; i < 5; i++) {
    cyl(g, 0.45, 0.55, 1.6 + i * 0.35, C.paper, -3.5 + i * 0.7, (1.6 + i * 0.35) / 2, 0)
    sphere(g, 0.32, C.gold, -3.5 + i * 0.7, 1.6 + i * 0.35 + 0.3, 0)
  }
  // 右：抵达后（粗粝、不对称）
  for (let i = 0; i < 7; i++) {
    box(
      g,
      0.7 + _rng() * 0.5,
      1 + _rng() * 2.2,
      0.7,
      C.stone,
      2.2 + _rng() * 2.8,
      (1 + _rng() * 2.2) / 2,
      (_rng() - 0.5) * 2.4,
      _rng()
    )
  }
  // 桥
  box(g, 2.8, 0.12, 0.55, C.vermilion, 0, 1.4, 0)
  return g
}

/** 阿纳斯塔西亚：运河网、欲望之城、市场 */
function anastasia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 运河网格
  for (let i = -2; i <= 2; i++) {
    box(g, 10, 0.1, 0.45, C.slate, 0, 0.1, i * 2)
    box(g, 0.45, 0.1, 10, C.slate, i * 2, 0.1, 0)
  }
  // 街区
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      if (x === 0 && z === 0) continue
      const h = 1.2 + _rng() * 2.4
      box(g, 1.2, h, 1.2, C.paper, x * 2, h / 2, z * 2)
    }
  }
  // 中央欲望之柱
  cyl(g, 0.55, 1.1, 5, C.vermilion, 0, 2.5, 0)
  sphere(g, 0.75, C.gold, 0, 5.3, 0)
  // 小船
  for (let i = 0; i < 4; i++) {
    box(g, 0.7, 0.22, 0.28, C.deep, (_rng() - 0.5) * 8, 0.25, (_rng() - 0.5) * 8)
  }
  return g
}

/** 德斯皮娜：双面城（港口/骆驼） */
function despina(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 半边港口
  for (let i = 0; i < 5; i++) {
    cyl(g, 0.35, 0.45, 1.8 + _rng(), C.slate, -3 + i * 0.85, 1, -2)
    box(g, 0.6, 0.12, 1.6, C.gold, -3 + i * 0.85, 2 + _rng(), -2)
  }
  // 半边沙漠城
  for (let i = 0; i < 5; i++) {
    box(g, 1.1, 1.4 + _rng(), 1.1, C.paper, 1 + i * 0.9, (1.4 + _rng()) / 2, 2)
  }
  // 中央分界线
  box(g, 0.12, 3.2, 7, C.ink, 0, 1.6, 0)
  // 双向箭头
  box(g, 1.8, 0.18, 0.18, C.vermilion, 0, 2.8, 0)
  return g
}

/** 费多拉：水晶球中的可能之城 */
function fedora(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 中央大水晶球
  const big = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 24, 18),
    mat(C.mist, 0.35)
  )
  big.position.y = 2.6
  g.add(big)
  // 球内小城
  box(g, 1.2, 1.6, 1.2, C.paper, 0, 2.2, 0)
  box(g, 0.7, 1.1, 0.7, C.vermilion, 0.7, 2.5, 0.4)
  cyl(g, 0.25, 0.35, 1.8, C.gold, -0.6, 2.8, -0.5)
  // 周围小球
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const r = 3.8
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 12), mat(C.mist, 0.3))
    s.position.set(Math.cos(a) * r, 1.4, Math.sin(a) * r)
    g.add(s)
    box(g, 0.4, 0.7, 0.4, C.stone, Math.cos(a) * r, 1.2, Math.sin(a) * r)
  }
  // 基座
  cyl(g, 2.4, 2.6, 0.5, C.stone, 0, 0.25, 0, 24)
  return g
}

/** 佐贝伊德：梦中追逐之城、街道如追捕路径 */
function zobeide(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 同心追逐环
  for (let i = 0; i < 5; i++) {
    torus(g, 1.2 + i * 1.05, 0.18, i === 2 ? C.vermilion : C.stone, 0, 0.3 + i * 0.3, 0)
  }
  // 墙体
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    const r = 2 + (i % 3) * 1.2
    box(g, 0.35, 1.6 + _rng() * 1.4, 0.35, C.paper, Math.cos(a) * r, 1, Math.sin(a) * r, a)
  }
  // 追逐路径
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < 30; i++) {
    const t = i / 30
    const a = t * Math.PI * 6
    const r = 0.5 + t * 4.2
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0.4 + t * 2.2, Math.sin(a) * r))
  }
  line(g, pts, C.vermilion, 0.55)
  return g
}

// ─────────────────────────────────────────
// 城市与符号
// ─────────────────────────────────────────

/** 塔玛拉：符号之城、目不暇接的招牌 */
function tamara(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 街道
  box(g, 8, 0.12, 2.2, C.paper, 0, 0.06, 0)
  // 两侧建筑挂满符号板
  for (let i = 0; i < 10; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const x = side * (2.2 + _rng())
    const z = -4 + Math.floor(i / 2) * 2
    const h = 2 + _rng() * 2
    box(g, 1.6, h, 1.4, C.stone, x, h / 2, z)
    // 符号板
    for (let j = 0; j < 3; j++) {
      box(g, 0.9, 0.55, 0.08, j === 0 ? C.vermilion : C.gold, x - side * 0.85, 1 + j * 0.8, z)
    }
  }
  // 中央符号塔
  box(g, 1.1, 5.2, 1.1, C.paper, 0, 2.6, -4)
  for (let i = 0; i < 5; i++) {
    box(g, 1.6, 0.7, 0.1, i === 2 ? C.vermilion : C.ink, 0, 1 + i * 1, -3.4)
  }
  return g
}

/** 齐尔玛：重复的符号、焦虑之城 */
function zirma(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 重复拱门
  for (let i = 0; i < 9; i++) {
    const z = -4.5 + i * 1.1
    box(g, 0.35, 3.2, 0.35, C.paper, -1.8, 1.6, z)
    box(g, 0.35, 3.2, 0.35, C.paper, 1.8, 1.6, z)
    box(g, 4, 0.35, 0.35, C.paper, 0, 3.1, z)
  }
  // 重复符号
  for (let i = 0; i < 12; i++) {
    box(g, 0.7, 0.7, 0.1, i % 4 === 0 ? C.vermilion : C.gold, 0, 2.2, -4.5 + i * 0.85)
  }
  // 基座
  box(g, 5, 0.3, 11, C.stone, 0, 0.15, 0)
  return g
}

/** 佐埃：生命之城、标签与活物 */
function zoe(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 底部生命体
  for (let i = 0; i < 16; i++) {
    const a = _rng() * Math.PI * 2
    const r = 1 + _rng() * 3.5
    sphere(g, 0.35 + _rng() * 0.45, i % 3 === 0 ? C.vermilion : C.deep, Math.cos(a) * r, 0.5, Math.sin(a) * r)
  }
  // 标签柱
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const r = 2.2
    box(g, 0.18, 3.2, 0.18, C.paper, Math.cos(a) * r, 1.6, Math.sin(a) * r)
    box(g, 0.85, 0.5, 0.08, C.gold, Math.cos(a) * r, 2.8, Math.sin(a) * r, a)
  }
  // 中央生命之树
  cyl(g, 0.35, 0.55, 3.2, C.deep, 0, 1.6, 0)
  for (let i = 0; i < 5; i++) {
    sphere(g, 0.55, C.paper, (_rng() - 0.5) * 2, 3.2 + _rng() * 1.2, (_rng() - 0.5) * 2)
  }
  return g
}

/** 伊帕齐娅：符号与沉默 */
function ipazia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 立方阵
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      const h = 0.8 + _rng() * 2.6
      box(g, 0.75, h, 0.75, x === 0 && z === 0 ? C.vermilion : C.stone, x * 1.15, h / 2, z * 1.15)
    }
  }
  // 悬浮符号板
  for (let i = 0; i < 5; i++) {
    box(g, 1.8, 1.2, 0.1, C.gold, 0, 2.5 + i * 0.85, -3 + i * 1.4, i * 0.3)
  }
  // 中心空缺
  cyl(g, 0.6, 0.6, 4.2, C.ink, 0, 2.1, 0)
  return g
}

/** 奥利维亚：名字可换、石头纹理不变 */
function olivia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 不规则石阵（材质）
  for (let i = 0; i < 12; i++) {
    const a = _rng() * Math.PI * 2
    const r = 1.2 + _rng() * 3.2
    box(
      g,
      0.8 + _rng() * 1.1,
      1 + _rng() * 2.8,
      0.8 + _rng(),
      i % 3 === 0 ? C.deep : C.stone,
      Math.cos(a) * r,
      (1 + _rng() * 2.8) / 2,
      Math.sin(a) * r,
      _rng()
    )
  }
  // 可更换的名字牌
  for (let i = 0; i < 6; i++) {
    box(g, 1.1, 0.55, 0.08, C.paper, (_rng() - 0.5) * 5, 1.2 + i * 0.7, (_rng() - 0.5) * 5, _rng() * Math.PI)
  }
  // 中央石碑
  box(g, 1.6, 3.8, 0.5, C.vermilion, 0, 1.9, 0)
  return g
}

// ─────────────────────────────────────────
// 轻盈的城市
// ─────────────────────────────────────────

/** 伊萨乌拉：深渊上的井城 */
function isaura(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 井网
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    const r = i === 0 ? 0 : 2.4
    const x = i === 0 ? 0 : Math.cos(a) * r
    const z = i === 0 ? 0 : Math.sin(a) * r
    cyl(g, 0.85, 0.85, 3.2, C.paper, x, 1.6, z, 16)
    cyl(g, 0.55, 0.55, 3.4, C.ink, x, 1.5, z, 16)
  }
  // 深渊暗示
  cyl(g, 4.5, 4.8, 0.2, C.ink, 0, -0.4, 0, 32)
  // 桥
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    box(g, 2.4, 0.12, 0.55, C.gold, Math.cos(a) * 1.2, 3.1, Math.sin(a) * 1.2, a)
  }
  // 上层细柱
  for (let i = 0; i < 10; i++) {
    const a = _rng() * Math.PI * 2
    const r = 1 + _rng() * 3
    cyl(g, 0.08, 0.1, 2.2, C.slate, Math.cos(a) * r, 4.2, Math.sin(a) * r, 6)
  }
  return g
}

/** 珍诺比亚：高脚之城、风中的轻盈 */
function zenobia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 高脚柱
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r = 2.8 + (i % 2) * 1.1
    cyl(g, 0.12, 0.18, 5.5, C.slate, Math.cos(a) * r, 2.75, Math.sin(a) * r, 8)
  }
  // 轻质平台
  for (let i = 0; i < 4; i++) {
    ringPlatform(g, 2.2 + i * 0.85, 4.8 + i * 0.65, i === 1 ? C.vermilion : C.paper)
  }
  // 薄壁
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 0.12, 2.2, 1.4, C.paper, Math.cos(a) * 3.2, 5.6, Math.sin(a) * 3.2, a)
  }
  // 顶部细环
  torus(g, 3.8, 0.08, C.gold, 0, 7.6, 0)
  return g
}

/** 阿尔米拉：未完工、水管仍在滴水 */
function armilla(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 立柱森林
  for (let i = 0; i < 18; i++) {
    const a = _rng() * Math.PI * 2
    const r = 0.8 + _rng() * 4
    const h = 2 + _rng() * 5
    cyl(g, 0.12, 0.15, h, C.paper, Math.cos(a) * r, h / 2, Math.sin(a) * r, 6)
  }
  // 水管
  for (let i = 0; i < 5; i++) {
    const y = 1.5 + i * 1.1
    line(
      g,
      [new THREE.Vector3(-4, y, -3 + i), new THREE.Vector3(4, y, -3 + i)],
      C.slate,
      0.5
    )
    // 水滴
    sphere(g, 0.18, C.slate, (_rng() - 0.5) * 6, y - 0.4, -3 + i)
  }
  // 未完成拱
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.18, 6, 16, Math.PI),
    mat(C.gold, 0.7)
  )
  arch.position.set(0, 2.4, 0)
  g.add(arch)
  return g
}

/** 索芙洛妮娅：两座城轮换上场 */
function sofronia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 圆形舞台
  ringPlatform(g, 4.2, 0.15, C.stone)
  // 左城
  for (let i = 0; i < 6; i++) {
    box(g, 0.85, 1.2 + _rng() * 1.8, 0.85, C.paper, -2.4 + (i % 3) * 0.85, 1, -1 + Math.floor(i / 3) * 1)
  }
  // 右城（镜像偏移）
  for (let i = 0; i < 6; i++) {
    box(g, 0.85, 1.4 + _rng() * 1.6, 0.85, C.mist, 1.6 + (i % 3) * 0.85, 1, -1 + Math.floor(i / 3) * 1)
  }
  // 中央转轴
  cyl(g, 0.18, 0.18, 5, C.vermilion, 0, 2.5, 0)
  // 箭头
  box(g, 3.2, 0.12, 0.12, C.gold, 0, 3.2, 0)
  return g
}

/** 奥克塔维亚：悬空之城、网即地基 */
function ottavia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 网（线框）
  for (let i = -4; i <= 4; i++) {
    line(g, [new THREE.Vector3(-4.5, 0, i), new THREE.Vector3(4.5, 0, i)], C.gold, 0.35)
    line(g, [new THREE.Vector3(i, 0, -4.5), new THREE.Vector3(i, 0, 4.5)], C.gold, 0.35)
  }
  // 悬挂在网上的建筑
  for (let i = 0; i < 12; i++) {
    const x = (_rng() - 0.5) * 7
    const z = (_rng() - 0.5) * 7
    const h = 1 + _rng() * 2.4
    box(g, 0.7, h, 0.7, C.paper, x, h / 2 + 0.05, z)
  }
  // 深渊
  box(g, 10, 0.15, 10, C.ink, 0, -0.5, 0)
  // 桥索
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    line(
      g,
      [new THREE.Vector3(Math.cos(a) * 4.2, 0, Math.sin(a) * 4.2), new THREE.Vector3(Math.cos(a) * 6, 3.5, Math.sin(a) * 6)],
      C.slate,
      0.35
    )
  }
  return g
}

// ─────────────────────────────────────────
// 贸易的城市
// ─────────────────────────────────────────

/** 欧菲米亚：年度集市、记忆交易所 */
function eufemia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 市场摊位环
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const r = 3.2
    box(g, 1.1, 0.9, 1.1, i % 4 === 0 ? C.vermilion : C.paper, Math.cos(a) * r, 0.55, Math.sin(a) * r, a)
    box(g, 1.3, 0.12, 1.3, C.gold, Math.cos(a) * r, 1.15, Math.sin(a) * r, a)
  }
  // 中央交易台
  cyl(g, 1.6, 1.8, 0.55, C.stone, 0, 0.3, 0, 20)
  cyl(g, 0.35, 0.35, 2.8, C.deep, 0, 1.7, 0)
  sphere(g, 0.55, C.gold, 0, 3.3, 0)
  // 货箱
  for (let i = 0; i < 8; i++) {
    box(g, 0.55, 0.55, 0.55, C.deep, (_rng() - 0.5) * 6, 0.35, (_rng() - 0.5) * 6)
  }
  return g
}

/** 克洛埃：目光交错之城 */
function chloe(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 两列对视的楼
  for (let i = 0; i < 6; i++) {
    const h = 2 + _rng() * 2.5
    box(g, 1.3, h, 1.3, C.paper, -3.2, h / 2, -3 + i * 1.2)
    const h2 = 2 + _rng() * 2.5
    box(g, 1.3, h2, 1.3, C.mist, 3.2, h2 / 2, -3 + i * 1.2)
  }
  // 目光线
  for (let i = 0; i < 6; i++) {
    line(
      g,
      [new THREE.Vector3(-2.5, 1.5 + i * 0.4, -3 + i * 1.2), new THREE.Vector3(2.5, 1.5 + i * 0.4, -3 + i * 1.2)],
      i === 3 ? C.vermilion : C.gold,
      0.4
    )
  }
  // 中央广场
  box(g, 4.5, 0.12, 8, C.stone, 0, 0.06, 0)
  return g
}

/** 欧特罗皮亚：角色轮换之城 */
function eutropia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 环形街区
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r = 3.5
    const h = 1.2 + (i % 3) * 0.8
    box(g, 1.2, h, 1.2, i % 3 === 0 ? C.vermilion : C.paper, Math.cos(a) * r, h / 2, Math.sin(a) * r, a)
  }
  // 轮换箭头环
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    box(g, 0.8, 0.12, 0.12, C.gold, Math.cos(a) * 2.2, 1.5, Math.sin(a) * 2.2, a)
  }
  // 中心舞台
  cyl(g, 1.4, 1.5, 0.45, C.stone, 0, 0.25, 0, 20)
  // 角色色块
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    box(g, 0.55, 1.1, 0.55, [C.vermilion, C.gold, C.slate, C.deep, C.paper][i], Math.cos(a) * 0.9, 0.8, Math.sin(a) * 0.9)
  }
  return g
}

/** 埃尔西莉亚：以线定义之城 */
function ersilia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 节点
  const nodes: THREE.Vector3[] = []
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r = 1.5 + _rng() * 3
    const p = new THREE.Vector3(Math.cos(a) * r, 1 + _rng() * 3, Math.sin(a) * r)
    nodes.push(p)
    sphere(g, 0.32, i === 0 ? C.vermilion : C.paper, p.x, p.y, p.z)
  }
  // 关系线
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (_rng() > 0.55) continue
      line(g, [nodes[i], nodes[j]], C.gold, 0.28)
    }
  }
  // 底盘
  ringPlatform(g, 4.5, 0.1, C.stone)
  return g
}

/** 斯梅拉尔迪娜：水道括起两岸 */
function smeraldina(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 水道
  box(g, 10, 0.15, 1.8, C.slate, 0, 0.08, 0)
  // 两岸建筑
  for (let i = 0; i < 8; i++) {
    const h = 1.4 + _rng() * 2.2
    box(g, 1.1, h, 1.1, C.paper, -4 + i * 1.15, h / 2, -2.2)
    const h2 = 1.4 + _rng() * 2.2
    box(g, 1.1, h2, 1.1, C.mist, -4 + i * 1.15, h2 / 2, 2.2)
  }
  // 拱桥
  for (let i = -1; i <= 1; i++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.12, 6, 16, Math.PI), mat(C.gold, 0.7))
    arch.position.set(i * 3, 1.2, 0)
    g.add(arch)
    box(g, 2.6, 0.12, 0.5, C.paper, i * 3, 1.85, 0)
  }
  // 小船
  box(g, 0.9, 0.22, 0.35, C.vermilion, 1.5, 0.28, 0)
  box(g, 0.9, 0.22, 0.35, C.deep, -2, 0.28, 0.3)
  return g
}

// ─────────────────────────────────────────
// 城市与眼睛
// ─────────────────────────────────────────

/** 瓦尔德拉达：湖面倒影的双生城 */
function valdrada(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 上层城市
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const r = 1.5 + _rng() * 2.8
    const h = 1.5 + _rng() * 2.8
    box(g, 0.85, h, 0.85, C.paper, Math.cos(a) * r, h / 2, Math.sin(a) * r)
  }
  cyl(g, 0.5, 0.75, 4.2, C.vermilion, 0, 2.1, 0)
  sphere(g, 0.55, C.gold, 0, 4.5, 0)
  // 湖面
  const lake = new THREE.Mesh(new THREE.CircleGeometry(5, 32), mat(C.slate, 0.28))
  lake.rotation.x = -Math.PI / 2
  lake.position.y = -0.05
  g.add(lake)
  // 倒影（半透明重复）
  const reflect = g.clone()
  reflect.scale.y = -1
  reflect.position.y = -0.1
  reflect.traverse((obj) => {
    const m = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
    if (m) {
      m.transparent = true
      m.opacity = 0.28
    }
  })
  // 避免自我递归：不把 reflect 再 clone
  g.add(reflect as THREE.Object3D)
  return g
}

/** 泽姆鲁德：俯瞰/仰望决定观感 */
function zemrude(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 下层：沉重井状
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    cyl(g, 0.9, 0.9, 2.2, C.deep, Math.cos(a) * 2.8, 1.1, Math.sin(a) * 2.8, 10)
    cyl(g, 0.55, 0.55, 2.4, C.ink, Math.cos(a) * 2.8, 1.0, Math.sin(a) * 2.8, 10)
  }
  // 上层：轻盈云端
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5
    sphere(g, 0.7, C.paper, Math.cos(a) * 2.4, 3.6 + (i % 2) * 0.6, Math.sin(a) * 2.4)
    box(g, 0.55, 0.85, 0.55, C.mist, Math.cos(a) * 2.4, 3.2, Math.sin(a) * 2.4)
  }
  // 分界线
  torus(g, 3.4, 0.06, C.vermilion, 0, 2.6, 0)
  return g
}

/** 鲍西斯：高脚城，向下看见自己的影子 */
function bauci(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 极细高柱
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    const r = 2.2 + (i % 2) * 1.3
    cyl(g, 0.07, 0.1, 7, C.slate, Math.cos(a) * r, 3.5, Math.sin(a) * r, 6)
  }
  // 顶部城市平台
  ringPlatform(g, 3.2, 6.8, C.paper)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 0.7, 1 + _rng() * 1.2, 0.7, i === 2 ? C.vermilion : C.mist, Math.cos(a) * 2, 7.5, Math.sin(a) * 2)
  }
  // 地面影子
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24), mat(C.ink, 0.12))
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.05
  g.add(shadow)
  // 影子城市
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    box(g, 0.6, 0.35, 0.6, C.ink, Math.cos(a) * 2, 0.25, Math.sin(a) * 2)
  }
  return g
}

/** 菲莉德：凝视之城 */
function fillide(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 环形透镜
  for (let i = 0; i < 4; i++) {
    torus(g, 1.6 + i * 1.15, 0.1, i === 1 ? C.vermilion : C.slate, 0, 2.2, 0, Math.PI / 2.4)
  }
  // 中心瞳孔
  sphere(g, 0.85, C.ink, 0, 2.2, 0)
  sphere(g, 0.35, C.gold, 0, 2.2, 0.7)
  // 四周观望台
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const r = 3.8
    box(g, 0.75, 1.6, 0.75, C.paper, Math.cos(a) * r, 0.8, Math.sin(a) * r, a)
  }
  // 视线
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    line(
      g,
      [new THREE.Vector3(Math.cos(a) * 3.5, 1.5, Math.sin(a) * 3.5), new THREE.Vector3(0, 2.2, 0)],
      C.gold,
      0.25
    )
  }
  return g
}

/** 莫里亚娜：正面镀金、背面水管 */
function moriana(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 正面（金碧）
  for (let i = 0; i < 6; i++) {
    box(g, 1.3, 1.8 + _rng() * 1.8, 0.55, C.gold, -3.5 + i * 1.4, 1.4, -1.2)
    sphere(g, 0.32, C.vermilion, -3.5 + i * 1.4, 2.8 + _rng(), -1.2)
  }
  box(g, 8.5, 0.18, 0.7, C.vermilion, 0, 3.2, -1.2)
  // 背面（水管）
  for (let i = 0; i < 6; i++) {
    cyl(g, 0.12, 0.12, 2.4, C.slate, -3.5 + i * 1.4, 1.2, 1.2, 8)
    line(
      g,
      [new THREE.Vector3(-3.5 + i * 1.4, 2.2, 1.2), new THREE.Vector3(-3.5 + i * 1.4, 2.2, 3)],
      C.ink,
      0.35
    )
  }
  // 分界板
  box(g, 8.5, 3.2, 0.1, C.ink, 0, 1.6, 0)
  return g
}

// ─────────────────────────────────────────
// 城市与名字
// ─────────────────────────────────────────

/** 阿格劳拉：说出的语言与砌进墙的语言 */
function aglaura(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 墙体（沉默）
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 2.2, 3.2, 0.35, C.stone, Math.cos(a) * 3.2, 1.6, Math.sin(a) * 3.2, a)
  }
  // 悬浮词（可说的）
  for (let i = 0; i < 10; i++) {
    box(g, 0.85, 0.4, 0.08, i % 3 === 0 ? C.vermilion : C.paper, (_rng() - 0.5) * 5, 1.2 + _rng() * 2.8, (_rng() - 0.5) * 5, _rng() * Math.PI)
  }
  // 中央对照柱
  cyl(g, 0.4, 0.4, 4.2, C.deep, 0, 2.1, 0)
  return g
}

/** 莱安德拉：被管理的名字 */
function leandra(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 档案架
  for (let i = 0; i < 6; i++) {
    box(g, 0.25, 4.2, 2.4, C.paper, -3 + i * 1.2, 2.1, 0)
    // 名字条
    for (let j = 0; j < 5; j++) {
      box(g, 0.08, 0.35, 1.8, j === 2 ? C.vermilion : C.gold, -3 + i * 1.2, 0.8 + j * 0.7, 0)
    }
  }
  // 分类标签
  box(g, 6.5, 0.18, 0.5, C.vermilion, 0, 4.5, 0)
  return g
}

/** 皮拉：刻在石上的名字 */
function pirra(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 石碑林
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const r = 2 + _rng() * 2
    const h = 2 + _rng() * 2.8
    box(g, 1.1, h, 0.35, i === 3 ? C.vermilion : C.stone, Math.cos(a) * r, h / 2, Math.sin(a) * r, a)
    // 刻痕
    for (let j = 0; j < 3; j++) {
      box(g, 0.7, 0.08, 0.05, C.ink, Math.cos(a) * r, 0.8 + j * 0.7, Math.sin(a) * r + 0.2, a)
    }
  }
  // 中央圆石
  sphere(g, 1.1, C.paper, 0, 1.1, 0)
  return g
}

/** 克拉莉丝：旧名字上的新城 */
function clarice(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 废墟基座
  for (let i = 0; i < 12; i++) {
    const a = _rng() * Math.PI * 2
    const r = 0.8 + _rng() * 3.5
    box(g, 0.8 + _rng() * 0.6, 0.5 + _rng() * 0.5, 0.8, C.deep, Math.cos(a) * r, 0.35, Math.sin(a) * r, _rng())
  }
  // 新城
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const h = 1.8 + _rng() * 2.2
    box(g, 0.85, h, 0.85, C.paper, Math.cos(a) * 2.2, 0.8 + h / 2, Math.sin(a) * 2.2, a)
  }
  // 旧名牌（仍在）
  box(g, 1.8, 0.85, 0.15, C.vermilion, 0, 3.8, 0)
  return g
}

/** 伊蕾妮：远看是城、近看是「差不多」 */
function irene(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 重复相似塔楼
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    const r = 2.5
    cyl(g, 0.55, 0.65, 3.2 + (i % 2) * 0.3, C.paper, Math.cos(a) * r, 1.7, Math.sin(a) * r)
    sphere(g, 0.45, C.mist, Math.cos(a) * r, 3.6 + (i % 2) * 0.3, Math.sin(a) * r)
  }
  // 中心：稍有不同
  cyl(g, 0.65, 0.75, 3.8, C.vermilion, 0, 1.9, 0)
  sphere(g, 0.5, C.gold, 0, 4, 0)
  // 模糊光晕
  torus(g, 4.2, 0.08, C.gold, 0, 2, 0)
  return g
}

// ─────────────────────────────────────────
// 城市与死亡
// ─────────────────────────────────────────

/** 梅拉尼亚：角色循环、死亡只是换面具 */
function melania(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 环形剧场
  ringPlatform(g, 4.2, 0.15, C.stone)
  // 环上角色柱
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const h = 1.6 + _rng() * 1.2
    box(g, 0.7, h, 0.7, i % 5 === 0 ? C.vermilion : C.paper, Math.cos(a) * 3.2, h / 2, Math.sin(a) * 3.2)
    // 面具
    sphere(g, 0.32, C.gold, Math.cos(a) * 3.2, h + 0.35, Math.sin(a) * 3.2)
  }
  // 中央旋转舞台
  cyl(g, 1.3, 1.3, 0.4, C.deep, 0, 0.25, 0, 20)
  // 箭头环
  torus(g, 1.8, 0.08, C.vermilion, 0, 0.6, 0)
  return g
}

/** 阿德尔玛：死者的城、每张脸都像故人 */
function adelma(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 下沉广场
  cyl(g, 4.2, 3.8, 1.2, C.stone, 0, 0.6, 0, 32)
  // 环壁上的面孔（球体）
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    sphere(g, 0.38, i % 4 === 0 ? C.vermilion : C.paper, Math.cos(a) * 3.6, 1.1, Math.sin(a) * 3.6)
  }
  // 中央塔
  cyl(g, 0.55, 0.85, 3.5, C.deep, 0, 2, 0)
  sphere(g, 0.6, C.gold, 0, 4, 0)
  // 阶梯
  for (let i = 0; i < 4; i++) {
    ringPlatform(g, 3.2 - i * 0.55, 1.3 + i * 0.35, C.mist)
  }
  return g
}

/** 欧萨皮亚：地上城与地下城彼此模仿 */
function eusapia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 地上城
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const h = 1.6 + _rng() * 1.8
    box(g, 0.9, h, 0.9, C.paper, Math.cos(a) * 2.6, h / 2, Math.sin(a) * 2.6, a)
  }
  // 地平线
  box(g, 10, 0.18, 10, C.stone, 0, 0, 0)
  // 地下城（镜像半透明）
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const h = 1.6 + _rng() * 1.8
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, h, 0.9), mat(C.deep, 0.4))
    m.position.set(Math.cos(a) * 2.6, -h / 2, Math.sin(a) * 2.6)
    m.rotation.y = a
    g.add(m)
  }
  // 中央贯通柱
  cyl(g, 0.35, 0.35, 5, C.vermilion, 0, 0, 0)
  return g
}

/** 阿尔吉亚：尘土之城 */
function argia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 尘堆（圆锥）
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    const r = i === 0 ? 0 : 2.6
    const h = 1.5 + _rng() * 1.6
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, h, 10), mat(C.deep, 0.85))
    cone.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r)
    g.add(cone)
  }
  // 地下轮廓
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    box(g, 0.85, 1.2, 0.85, C.ink, Math.cos(a) * 2.2, -1, Math.sin(a) * 2.2, a)
  }
  // 地面
  ringPlatform(g, 4.5, 0.08, C.mist)
  return g
}

/** 劳多米亚：活人城与死人城孪生 */
function laudomia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 左：活人城
  for (let i = 0; i < 6; i++) {
    const h = 1.8 + _rng() * 2.2
    box(g, 0.9, h, 0.9, C.paper, -3.4 + (i % 3) * 1.1, h / 2, -1 + Math.floor(i / 3) * 1.4)
    sphere(g, 0.28, C.gold, -3.4 + (i % 3) * 1.1, h + 0.3, -1 + Math.floor(i / 3) * 1.4)
  }
  // 右：死人城（更低沉）
  for (let i = 0; i < 6; i++) {
    const h = 1.4 + _rng() * 1.6
    box(g, 0.9, h, 0.9, C.deep, 1.2 + (i % 3) * 1.1, h / 2, -1 + Math.floor(i / 3) * 1.4)
  }
  // 分界
  box(g, 0.12, 3.5, 6, C.vermilion, -0.6, 1.75, 0)
  // 地图共用
  box(g, 8.5, 0.15, 6, C.stone, 0, 0.08, 0)
  return g
}

// ─────────────────────────────────────────
// 城市与天空
// ─────────────────────────────────────────

/** 欧多西亚：地毯上的天意 */
function eudossia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 巨型地毯
  box(g, 9, 0.15, 7, C.vermilion, 0, 0.08, 0)
  box(g, 7.5, 0.12, 5.5, C.gold, 0, 0.18, 0)
  box(g, 5.5, 0.1, 3.8, C.paper, 0, 0.28, 0)
  // 建筑站在地毯上
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const h = 1.4 + _rng() * 1.8
    box(g, 0.75, h, 0.75, C.stone, Math.cos(a) * 2.8, 0.35 + h / 2, Math.sin(a) * 2.2)
  }
  // 中央星图
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    sphere(g, 0.22, C.paper, Math.cos(a) * 1.3, 1.8, Math.sin(a) * 1.3)
    line(
      g,
      [new THREE.Vector3(Math.cos(a) * 1.3, 1.8, Math.sin(a) * 1.3), new THREE.Vector3(0, 1.8, 0)],
      C.gold,
      0.3
    )
  }
  return g
}

/** 贝尔萨贝亚：天上城与尘世脚注 */
function bersabea(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 天上城（悬浮）
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    box(g, 0.85, 1.4, 0.85, C.paper, Math.cos(a) * 1.8, 5.5, Math.sin(a) * 1.8)
    sphere(g, 0.35, C.gold, Math.cos(a) * 1.8, 6.5, Math.sin(a) * 1.8)
  }
  torus(g, 2.6, 0.1, C.gold, 0, 5.2, 0)
  // 尘世脚注（小而简）
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 0.6, 0.7 + _rng() * 0.6, 0.6, C.stone, Math.cos(a) * 3.2, 0.4, Math.sin(a) * 3.2)
  }
  // 垂直线
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    line(
      g,
      [new THREE.Vector3(Math.cos(a) * 1.8, 4.8, Math.sin(a) * 1.8), new THREE.Vector3(Math.cos(a) * 3, 1, Math.sin(a) * 3)],
      C.slate,
      0.22
    )
  }
  return g
}

/** 泰克拉：永远在开工 */
function tecla(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 未完成柱廊
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r = 2.8
    const h = 1 + _rng() * 3.2
    cyl(g, 0.22, 0.28, h, C.paper, Math.cos(a) * r, h / 2, Math.sin(a) * r)
    // 脚手架
    line(
      g,
      [new THREE.Vector3(Math.cos(a) * r, h, Math.sin(a) * r), new THREE.Vector3(Math.cos(a) * r + 0.8, h + 1.2, Math.sin(a) * r)],
      C.gold,
      0.35
    )
  }
  // 中央塔（未封顶）
  for (let i = 0; i < 6; i++) {
    ringPlatform(g, 1.1 - i * 0.12, i * 0.7, i === 3 ? C.vermilion : C.stone)
  }
  // 天空评审环
  torus(g, 4, 0.06, C.slate, 0, 4.5, 0)
  return g
}

/** 佩林齐亚：天与地之间的模棱两可 */
function perinzia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 下半：街道
  box(g, 7, 0.12, 2.2, C.stone, 0, 0.06, 0)
  for (let i = 0; i < 6; i++) {
    box(g, 1, 1.2 + _rng(), 1, C.paper, -3 + i * 1.2, 0.7, -1.6)
    box(g, 1, 1.2 + _rng(), 1, C.paper, -3 + i * 1.2, 0.7, 1.6)
  }
  // 上半：象征体
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    sphere(g, 0.55, C.mist, Math.cos(a) * 2.2, 3.5, Math.sin(a) * 2.2)
    line(
      g,
      [new THREE.Vector3(Math.cos(a) * 2.2, 2.8, Math.sin(a) * 2.2), new THREE.Vector3(0, 2, 0)],
      C.gold,
      0.25
    )
  }
  // 中间雾层
  torus(g, 3.2, 0.15, C.slate, 0, 2.2, 0)
  return g
}

/** 安德里亚：按星辰排列的城市 */
function andria(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 星位圆点
  const stars: THREE.Vector3[] = []
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const r = 3.2
    const p = new THREE.Vector3(Math.cos(a) * r, 0.25, Math.sin(a) * r)
    stars.push(p)
    sphere(g, 0.22, C.gold, p.x, p.y, p.z)
  }
  // 建筑对齐星位
  for (let i = 0; i < 8; i++) {
    const h = 1.4 + (i % 3) * 0.8
    box(g, 0.75, h, 0.75, i === 2 ? C.vermilion : C.paper, stars[i].x, h / 2, stars[i].z, (i / 8) * Math.PI * 2)
  }
  // 星图连线
  for (let i = 0; i < stars.length; i++) {
    line(g, [stars[i], stars[(i + 1) % stars.length]], C.slate, 0.28)
    line(g, [stars[i], new THREE.Vector3(0, 0.25, 0)], C.gold, 0.18)
  }
  // 中央天文塔
  cyl(g, 0.35, 0.55, 3.2, C.stone, 0, 1.6, 0)
  torus(g, 1.1, 0.08, C.gold, 0, 3.2, 0, 0)
  return g
}

// ─────────────────────────────────────────
// 连绵的城市
// ─────────────────────────────────────────

/** 莱奥尼亚：每日丢弃、永远崭新 */
function leonia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 新城（洁白）
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const h = 1.8 + _rng() * 2
    box(g, 0.95, h, 0.95, C.paper, Math.cos(a) * 2.4, h / 2, Math.sin(a) * 2.4)
    sphere(g, 0.28, C.mist, Math.cos(a) * 2.4, h + 0.3, Math.sin(a) * 2.4)
  }
  // 垃圾山（边界）
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r = 4.2
    box(g, 0.55 + _rng() * 0.5, 0.35 + _rng() * 0.5, 0.55, i % 3 === 0 ? C.vermilion : C.deep, Math.cos(a) * r, 0.3, Math.sin(a) * r, _rng())
  }
  // 中央洁净台
  ringPlatform(g, 1.6, 0.2, C.gold)
  return g
}

/** 特鲁德：所有城都一样 */
function trude(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 无限重复的街区网格
  for (let x = -3; x <= 3; x++) {
    for (let z = -3; z <= 3; z++) {
      const h = 1.6
      box(g, 0.8, h, 0.8, C.paper, x * 1.3, h / 2, z * 1.3)
    }
  }
  // 贯穿长街
  box(g, 9, 0.1, 0.55, C.vermilion, 0, 0.05, 0)
  box(g, 0.55, 0.1, 9, C.vermilion, 0, 0.05, 0)
  // 标志塔（也一样）
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    cyl(g, 0.35, 0.45, 3.2, C.mist, Math.cos(a) * 3.2, 1.6, Math.sin(a) * 3.2)
    sphere(g, 0.35, C.gold, Math.cos(a) * 3.2, 3.4, Math.sin(a) * 3.2)
  }
  return g
}

/** 普罗科皮亚：人口密度即宪法 */
function procopia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 密集立方
  for (let i = 0; i < 40; i++) {
    const x = (_rng() - 0.5) * 8
    const z = (_rng() - 0.5) * 8
    const h = 0.6 + _rng() * 3.2
    box(g, 0.55, h, 0.55, i % 5 === 0 ? C.vermilion : C.paper, x, h / 2, z)
  }
  // 密度环
  torus(g, 2, 0.1, C.gold, 0, 1.2, 0)
  torus(g, 3.4, 0.1, C.gold, 0, 1.2, 0)
  // 中央高密度
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 0.45, 2.4, 0.45, C.deep, Math.cos(a) * 0.9, 1.2, Math.sin(a) * 0.9)
  }
  return g
}

/** 切奇莉亚：被河流分段的城 */
function cecilia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 河
  box(g, 10, 0.12, 1.6, C.slate, 0, 0.06, 0)
  // 多段城区
  for (let seg = -2; seg <= 2; seg++) {
    for (let i = 0; i < 4; i++) {
      const h = 1.2 + _rng() * 1.8
      box(g, 0.8, h, 0.8, seg === 0 ? C.vermilion : C.paper, seg * 2, h / 2, -2.4 + i * 1.2)
      box(g, 0.8, h, 0.8, C.mist, seg * 2, h / 2, 1.2 + i * 1.2)
    }
    // 桥
    box(g, 1.8, 0.12, 0.55, C.gold, seg * 2, 1.4, 0)
  }
  return g
}

/** 潘忒西莱亚：新旧缠绕 */
function penthesilea(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 旧城（下沉、残缺）
  for (let i = 0; i < 10; i++) {
    const a = _rng() * Math.PI * 2
    const r = 1 + _rng() * 3.5
    box(g, 0.8 + _rng() * 0.5, 0.5 + _rng() * 0.8, 0.8, C.deep, Math.cos(a) * r, 0.35, Math.sin(a) * r, _rng())
  }
  // 新城（上升、完整）
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    const h = 1.6 + _rng() * 2.4
    box(g, 0.75, h, 0.75, C.paper, Math.cos(a) * 2.6, 0.6 + h / 2, Math.sin(a) * 2.6)
  }
  // 缠绕线
  for (let i = 0; i < 5; i++) {
    const pts: THREE.Vector3[] = []
    for (let j = 0; j < 12; j++) {
      const t = j / 11
      const a = t * Math.PI * 3 + i
      const r = 1.2 + t * 2.4
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0.4 + t * 2.2, Math.sin(a) * r))
    }
    line(g, pts, i === 2 ? C.vermilion : C.gold, 0.35)
  }
  return g
}

// ─────────────────────────────────────────
// 隐蔽的城市
// ─────────────────────────────────────────

/** 奥琳达：城中之城，无限递归 */
function olinda(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 递归方框
  for (let i = 0; i < 5; i++) {
    const s = 6 - i * 1.1
    const y = i * 0.7
    const color = i === 2 ? C.vermilion : C.paper
    // 四面墙
    box(g, s, 0.7, 0.18, color, 0, y + 0.35, -s / 2)
    box(g, s, 0.7, 0.18, color, 0, y + 0.35, s / 2)
    box(g, 0.18, 0.7, s, color, -s / 2, y + 0.35, 0)
    box(g, 0.18, 0.7, s, color, s / 2, y + 0.35, 0)
  }
  // 中心核心
  sphere(g, 0.55, C.gold, 0, 3.8, 0)
  return g
}

/** 拉伊萨：不幸中隐藏的幸福 */
function raissa(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 压抑的城体
  for (let i = 0; i < 12; i++) {
    const a = _rng() * Math.PI * 2
    const r = 0.8 + _rng() * 3.2
    box(g, 0.9, 1.2 + _rng() * 1.6, 0.9, C.deep, Math.cos(a) * r, 0.8, Math.sin(a) * r, _rng())
  }
  // 隐藏的幸福光点
  for (let i = 0; i < 8; i++) {
    sphere(g, 0.18, C.gold, (_rng() - 0.5) * 6, 1 + _rng() * 3, (_rng() - 0.5) * 6)
    line(
      g,
      [new THREE.Vector3((_rng() - 0.5) * 6, 1 + _rng() * 3, (_rng() - 0.5) * 6), new THREE.Vector3(0, 0.5, 0)],
      C.gold,
      0.15
    )
  }
  // 中央微光
  sphere(g, 0.35, C.vermilion, 0, 2.2, 0)
  return g
}

/** 马罗齐亚：树根与屋顶的两种生命 */
function marozia(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 向上：屋顶
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    box(g, 0.85, 1.6, 0.85, C.paper, Math.cos(a) * 2.2, 1, Math.sin(a) * 2.2)
    // 三角屋顶
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.7, 4), mat(C.vermilion, 0.85))
    roof.position.set(Math.cos(a) * 2.2, 2.15, Math.sin(a) * 2.2)
    roof.rotation.y = Math.PI / 4
    g.add(roof)
  }
  // 向下：根系
  for (let i = 0; i < 10; i++) {
    const a = _rng() * Math.PI * 2
    const r = 0.5 + _rng() * 3
    line(
      g,
      [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * r, -1.8 - _rng(), Math.sin(a) * r)],
      C.deep,
      0.35
    )
    sphere(g, 0.2, C.deep, Math.cos(a) * r, -1.5 - _rng(), Math.sin(a) * r)
  }
  return g
}

/** 泰奥多拉：被消灭的动物换一种身体继续住 */
function teodora(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 兽骨弧
  for (let i = 0; i < 4; i++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.6 + i * 0.55, 0.12, 6, 16, Math.PI), mat(C.paper, 0.75))
    arch.position.set(0, 1.2 + i * 0.35, -1.5 + i * 0.9)
    g.add(arch)
  }
  // 变形的动物体
  for (let i = 0; i < 7; i++) {
    const a = _rng() * Math.PI * 2
    const r = 1 + _rng() * 2.8
    box(g, 0.7, 0.5 + _rng() * 0.5, 1.1, i === 2 ? C.vermilion : C.stone, Math.cos(a) * r, 0.5, Math.sin(a) * r, _rng())
    sphere(g, 0.28, C.deep, Math.cos(a) * r, 1.1, Math.sin(a) * r)
  }
  // 新建筑寄生
  for (let i = 0; i < 5; i++) {
    box(g, 0.55, 1.4, 0.55, C.paper, (_rng() - 0.5) * 5, 0.9, (_rng() - 0.5) * 5)
  }
  return g
}

/** 贝蕾妮丝：公正之城的隐藏不义 */
function berenice(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  // 公开的公正：对称柱廊
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    cyl(g, 0.28, 0.35, 3.2, C.paper, Math.cos(a) * 3, 1.6, Math.sin(a) * 3)
    sphere(g, 0.32, C.gold, Math.cos(a) * 3, 3.5, Math.sin(a) * 3)
  }
  ringPlatform(g, 3.2, 0.15, C.stone)
  // 隐藏的不义：地下扭曲
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 0.7, 1.2, 0.7, C.ink, Math.cos(a) * 2.4, -1, Math.sin(a) * 2.4, a + 0.8)
  }
  // 中央天平（不对称）
  box(g, 0.15, 2.2, 0.15, C.vermilion, 0, 1.4, 0)
  box(g, 3.2, 0.12, 0.12, C.gold, 0.6, 2.6, 0)
  sphere(g, 0.28, C.vermilion, 1.9, 2.35, 0)
  sphere(g, 0.18, C.gold, -0.7, 2.5, 0)
  return g
}

// ─────────────────────────────────────────
// 注册表
// ─────────────────────────────────────────

export const CITY_BUILDERS: Record<string, (_rng: Rng) => THREE.Group> = {
  diomira,
  isidora,
  zaira,
  zora,
  maurilia,
  dorotea,
  anastasia,
  despina,
  fedora,
  zobeide,
  tamara,
  zirma,
  zoe,
  ipazia,
  olivia,
  isaura,
  zenobia,
  armilla,
  sofronia,
  ottavia,
  eufemia,
  chloe,
  eutropia,
  ersilia,
  smeraldina,
  valdrada,
  zemrude,
  bauci,
  fillide,
  moriana,
  aglaura,
  leandra,
  pirra,
  clarice,
  irene,
  melania,
  adelma,
  eusapia,
  argia,
  laudomia,
  eudossia,
  bersabea,
  tecla,
  perinzia,
  andria,
  leonia,
  trude,
  procopia,
  cecilia,
  penthesilea,
  olinda,
  raissa,
  marozia,
  teodora,
  berenice,
}

export function createCityModel(cityId: string, seed: number): THREE.Group {
  const builder = CITY_BUILDERS[cityId]
  const _rng = mulberry32(seed * 7919 + 31)
  const g = builder ? builder(_rng) : new THREE.Group()
  // 统一居中与尺度
  const box = new THREE.Box3().setFromObject(g)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const scale = 8 / maxDim
  g.position.sub(center.multiplyScalar(scale))
  g.scale.setScalar(scale)
  return g
}
