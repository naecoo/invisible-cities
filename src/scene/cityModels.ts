import * as THREE from 'three'
import {
  mat as _mat,
  type Rng,
  mulberry32,
  PALETTE as C,
  box,
  cyl,
  sphere,
  torus,
  line,
  addGround,
  addPaving,
  addRiver,
  addLake,
  addCanals,
  addHouse,
  addDome,
  addTower,
  addColumn,
  addArch,
  addScaffold,
  addPerson,
  addCrowd,
  addTree,
  addPalm,
  addLamp,
  addWaterfall,
  addSunLight,
  addGlow,
  addParticles,
  addShadowDisc,
} from './cityEnv'

/**
 * 55 城完整场景 — 光影 / 建筑 / 人物 / 水体
 * 意象依据原著城市描述
 */

function soft(color: number, opacity = 0.85) {
  return _mat(color, { transparent: opacity < 1, opacity, roughness: 0.88 })
}

export interface CityScene {
  group: THREE.Group
}

// ═══════════ 城市与记忆 ═══════════

/** 迪奥米拉：黄昏银顶林荫大道，象队，斜光窗格 */
function diomira(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 14)
  addPaving(g, 6, C.marble)

  // 林荫大道
  box(g, 3.2, 0.08, 12, C.marble, 0, 0.06, 0)
  for (let i = -5; i <= 5; i++) {
    addTree(g, -2.4, i * 1.1, 2.4)
    addTree(g, 2.4, i * 1.1, 2.4)
    addLamp(g, -1.8, 0, i * 1.1 + 0.5)
  }

  // 银色穹顶群
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2
    const r = 4.2 + rng() * 2.4
    addDome(g, 1.1 + rng() * 0.5, 2 + rng() * 1.6, i % 2 ? C.marble : C.gold, Math.cos(a) * r, Math.sin(a) * r)
  }

  // 窗光 — 斜照
  for (let i = 0; i < 6; i++) {
    addGlow(g, -3 + i * 1.2, 2.2, -3.5, C.gold, 0.45, 6)
  }

  // 象队
  for (let i = 0; i < 4; i++) {
    const z = 3.2 + i * 1.3
    box(g, 1.5, 1.15, 0.85, C.slate, 0, 0.75, z)
    cyl(g, 0.12, 0.12, 1.1, C.slate, 0, 0.55, z + 0.55, 7).rotation.x = 0.7
    sphere(g, 0.32, C.slate, 0, 1.55, z)
    // 象夫
    addPerson(g, 0, z, Math.PI, C.vermilion, 0.8)
  }

  addCrowd(g, 10, 5, rng)
  addParticles(g, 40, 8, [0.2, 4], C.gold, 0.06, rng)
  addShadowDisc(g, 8)
  return g
}

/** 伊西多拉：山城螺旋井，回忆 */
function isidora(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'grass', 12)

  // 山体
  const hill = new THREE.Mesh(new THREE.ConeGeometry(7, 5, 10), soft(C.earth))
  hill.position.y = 2.5
  hill.receiveShadow = true
  g.add(hill)

  // 螺旋街道
  for (let i = 0; i < 28; i++) {
    const t = i / 28
    const a = t * Math.PI * 4.2
    const r = 5.2 - t * 3.8
    box(g, 0.85, 0.12, 0.5, C.stone, Math.cos(a) * r, 0.8 + t * 3.8, Math.sin(a) * r, a)
    if (i % 3 === 0) addHouse(g, 0.9, 1 + rng(), 0.9, C.marble, Math.cos(a) * (r + 1), Math.sin(a) * (r + 1), a)
    if (i % 4 === 0) addPerson(g, Math.cos(a) * r, Math.sin(a) * r, a, C.cloth)
  }

  // 顶部
  addDome(g, 1.6, 1.8, C.marble, 0, 0)
  addGlow(g, 0, 5.5, 0, C.gold, 1, 8)

  // 井
  cyl(g, 0.7, 0.7, 2.2, C.ink, 2.8, 1.1, 1.2, 16)
  sphere(g, 0.5, C.waterDeep, 2.8, 2.1, 1.2)

  addParticles(g, 30, 6, [1, 5], C.gold, 0.05, rng)
  return g
}

/** 扎伊拉：层叠过去、铁丝、砖石 */
function zaira(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'earth', 12)

  // 层叠「纸页」地层
  for (let i = 0; i < 10; i++) {
    const s = 9 - i * 0.55
    box(g, s, 0.22, s * 0.78, i % 3 === 0 ? C.gold : C.marble, 0, i * 0.4, 0, i * 0.1)
  }

  // 砖石突出
  for (let i = 0; i < 16; i++) {
    box(g, 0.65, 0.4, 0.45, C.rust, (rng() - 0.5) * 6, 1.2 + rng() * 3, (rng() - 0.5) * 5)
  }

  // 铁丝网
  for (let i = 0; i < 12; i++) {
    const y = 1 + i * 0.35
    line(g, [new THREE.Vector3(-5, y, -4 + i * 0.6), new THREE.Vector3(5, y, -4 + i * 0.6)], C.ink, 0.35)
  }

  // 遗迹墙
  for (let i = 0; i < 6; i++) {
    box(g, 1.2, 2.2 + rng(), 0.35, C.stone, -4 + i * 1.6, 1.5, -3.5)
    addPerson(g, -4 + i * 1.6, -2, rng() * 3, C.cloth)
  }

  addShadowDisc(g, 7)
  return g
}

/** 佐拉：同心环、无法遗忘 */
function zora(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 14)
  addPaving(g, 8, C.marble)

  for (let i = 0; i < 7; i++) {
    torus(g, 1.4 + i * 1.1, 0.14, i === 3 ? C.vermilion : C.stone, 0, 0.25, 0)
  }
  // 径向街
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    line(g, [new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(Math.cos(a) * 7, 0.2, Math.sin(a) * 7)], C.ink, 0.22)
  }
  // 中心塔
  addTower(g, 1, 6, C.marble, 0, 0)
  addGlow(g, 0, 6.5, 0, C.gold, 1, 10)

  // 环上建筑与行人
  for (let i = 0; i < 22; i++) {
    const a = rng() * Math.PI * 2
    const r = 2 + rng() * 5
    addHouse(g, 0.9, 1.2 + rng(), 0.9, C.marble, Math.cos(a) * r, Math.sin(a) * r, a)
    if (rng() > 0.5) addPerson(g, Math.cos(a) * r, Math.sin(a) * r, a, C.cloth)
  }

  addParticles(g, 25, 7, [0.5, 4], C.gold, 0.05, rng)
  return g
}

/** 莫里利亚：旧明信片与新城并置 */
function maurilia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)

  // 旧城（倾斜）
  for (let i = 0; i < 7; i++) {
    box(g, 1.3, 0.2, 2, C.wood, -4.2, 0.6 + i * 0.75, (rng() - 0.5) * 2.5, 0.18)
  }
  // 新城
  for (let i = 0; i < 8; i++) {
    addHouse(g, 1.1, 1.4 + rng() * 1.8, 1.1, C.marble, 3.2 + rng(), -2 + i * 0.6)
  }

  // 桥
  box(g, 4, 0.18, 0.9, C.vermilion, 0, 2.4, 0)

  // 相框
  box(g, 2.8, 3.4, 0.12, C.gold, 0, 2, -4)
  box(g, 2.4, 3, 0.08, C.glass, 0, 2, -3.9)

  addCrowd(g, 8, 4, rng)
  return g
}

// ═══════════ 城市与欲望 ═══════════

/** 多萝泰亚：欲望前后双城 */
function dorotea(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 13)

  // 抵达前（精致）
  for (let i = 0; i < 5; i++) {
    addDome(g, 0.7, 1.6 + i * 0.3, C.marble, -4 + i * 0.85, 0)
    addColumn(g, 0.16, 2.2, C.gold, -4 + i * 0.85 + 0.9, 0, 0.6)
  }
  addPaving(g, 3, C.marble, 0)

  // 抵达后（粗粝）
  for (let i = 0; i < 9; i++) {
    addHouse(g, 1, 1 + rng() * 2, 1, C.stone, 2.4 + rng() * 2.8, -2 + rng() * 4, rng())
  }

  // 桥
  box(g, 3.2, 0.16, 0.7, C.vermilion, 0, 1.6, 0)
  addPerson(g, -0.5, 0, Math.PI / 2, C.vermilion)
  addPerson(g, 0.8, 0, -Math.PI / 2, C.cloth)

  addCrowd(g, 10, 5, rng)
  return g
}

/** 阿纳斯塔西亚：运河、市场、欲望 */
function anastasia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 13)
  addCanals(g, 10, 5)

  // 街区
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      if (x === 0 && z === 0) continue
      addHouse(g, 1.3, 1.6 + rng() * 1.6, 1.3, C.marble, x * 2, z * 2)
    }
  }

  // 中央欲望之柱
  addTower(g, 1, 5.5, C.vermilion, 0, 0)
  addGlow(g, 0, 5.8, 0, C.gold, 1.1, 10)

  // 小船
  for (let i = 0; i < 5; i++) {
    box(g, 0.9, 0.22, 0.38, C.wood, (rng() - 0.5) * 8, 0.22, (rng() - 0.5) * 8)
    addPerson(g, (rng() - 0.5) * 8, (rng() - 0.5) * 8, rng() * 6, C.cloth)
  }

  addCrowd(g, 14, 5, rng)
  addLamp(g, -2, 0, 2)
  addLamp(g, 2, 0, -2)
  return g
}

/** 德斯皮娜：港口/沙漠双面 */
function despina(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'sand', 12)

  // 港口半边
  addRiver(g, 5, 8, -3, 0)
  for (let i = 0; i < 5; i++) {
    addTower(g, 0.35, 2.2 + rng(), C.slate, -3.5 + i * 0.9, -2.5)
    box(g, 0.8, 0.14, 1.8, C.wood, -3.5 + i * 0.9, 2.2 + rng(), -2.5)
    addPerson(g, -3.5 + i * 0.9, -1.5, 0, C.cloth)
  }

  // 沙漠半边
  for (let i = 0; i < 5; i++) {
    addHouse(g, 1.2, 1.5 + rng(), 1.2, C.sand, 1.2 + i * 1, 2)
    addPalm(g, 2.5 + i, 3)
  }

  // 分界
  box(g, 0.14, 3.5, 8, C.ink, 0, 1.75, 0)
  box(g, 2, 0.18, 0.18, C.vermilion, 0, 3, 0)

  return g
}

/** 费多拉：水晶球中的可能之城 */
function fedora(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)
  addPaving(g, 5, C.marble)

  // 大水晶球
  const big = new THREE.Mesh(new THREE.SphereGeometry(2.6, 28, 20), soft(C.glass))
  big.material = new THREE.MeshStandardMaterial({
    color: C.glass,
    transparent: true,
    opacity: 0.32,
    roughness: 0.12,
    metalness: 0.2,
  })
  big.position.y = 3
  g.add(big)

  // 球内小城
  addHouse(g, 1, 1.5, 1, C.marble, 0, 3)
  addTower(g, 0.35, 1.8, C.vermilion, 0.6, 3.4)
  addGlow(g, 0, 3, 0, C.gold, 0.7, 6)

  // 周围小球
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const s = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), soft(C.glass))
    s.material = new THREE.MeshStandardMaterial({ color: C.glass, transparent: true, opacity: 0.3, roughness: 0.15 })
    s.position.set(Math.cos(a) * 4.2, 1.6, Math.sin(a) * 4.2)
    g.add(s)
    addHouse(g, 0.5, 0.8, 0.5, C.marble, Math.cos(a) * 4.2, Math.sin(a) * 4.2)
    addPerson(g, Math.cos(a) * 4.2, Math.sin(a) * 4.2 + 1.2, rng() * 6, C.cloth)
  }

  cyl(g, 3, 3.2, 0.55, C.stone, 0, 0.28, 0, 24)
  return g
}

/** 佐贝伊德：梦中追逐之城 */
function zobeide(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)
  addPaving(g, 7, C.marble)

  // 同心追逐环
  for (let i = 0; i < 5; i++) {
    torus(g, 1.4 + i * 1.15, 0.2, i === 2 ? C.vermilion : C.stone, 0, 0.22, 0)
  }

  // 白色墙
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const r = 2.2 + (i % 3) * 1.3
    box(g, 0.4, 2 + rng() * 1.6, 0.4, C.marble, Math.cos(a) * r, 1.2, Math.sin(a) * r, a)
    addArch(g, 1.4, 1.8, 0.28, C.marble, Math.cos(a) * (r + 1), 0, Math.sin(a) * (r + 1), a)
  }

  // 追逐路径
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < 30; i++) {
    const t = i / 30
    const a = t * Math.PI * 6
    const r = 0.5 + t * 4.5
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0.35, Math.sin(a) * r))
  }
  line(g, pts, C.vermilion, 0.55)

  addCrowd(g, 12, 5, rng)
  return g
}

// ═══════════ 城市与符号 ═══════════

/** 塔玛拉：符号之城 */
function tamara(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)
  box(g, 9, 0.08, 2.6, C.marble, 0, 0.05, 0)

  for (let i = 0; i < 12; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const x = side * (2.6 + rng() * 0.8)
    const z = -5 + Math.floor(i / 2) * 2
    addHouse(g, 1.8, 2.4 + rng() * 1.8, 1.5, C.marble, x, z, side > 0 ? -0.2 : 0.2)
    // 符号板
    for (let j = 0; j < 3; j++) {
      box(g, 1, 0.6, 0.1, j === 0 ? C.vermilion : C.gold, x - side * 1, 1.1 + j * 0.85, z)
    }
    addPerson(g, x * 0.5, z + 0.5, rng() * 6, C.cloth)
  }

  addTower(g, 1, 5.5, C.marble, 0, -5)
  for (let i = 0; i < 5; i++) {
    box(g, 1.8, 0.8, 0.12, i === 2 ? C.vermilion : C.ink, 0, 1.1 + i * 1, -4.3)
  }
  return g
}

/** 齐尔玛：重复符号、焦虑 */
function zirma(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)
  box(g, 6, 0.25, 12, C.stone, 0, 0.12, 0)

  for (let i = 0; i < 10; i++) {
    const z = -5 + i * 1.1
    addArch(g, 4, 3.2, 0.35, C.marble, 0, 0, z)
    box(g, 0.8, 0.8, 0.1, i % 3 === 0 ? C.vermilion : C.gold, 0, 2.4, z)
    addPerson(g, (rng() - 0.5) * 2, z, 0, C.cloth)
  }
  return g
}

/** 佐埃：生命与标签 */
function zoe(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'grass', 11)

  // 生命体
  for (let i = 0; i < 14; i++) {
    const a = rng() * Math.PI * 2
    const r = 1 + rng() * 4
    sphere(g, 0.4 + rng() * 0.5, i % 3 === 0 ? C.vermilion : C.leaf, Math.cos(a) * r, 0.55, Math.sin(a) * r)
    addPerson(g, Math.cos(a) * r, Math.sin(a) * r, a, C.cloth)
  }

  // 标签柱
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    cyl(g, 0.12, 0.12, 3.2, C.marble, Math.cos(a) * 2.6, 1.6, Math.sin(a) * 2.6, 8)
    box(g, 0.9, 0.55, 0.08, C.gold, Math.cos(a) * 2.6, 2.9, Math.sin(a) * 2.6, a)
  }

  // 生命树
  cyl(g, 0.35, 0.55, 3.2, C.wood, 0, 1.6, 0, 8)
  for (let i = 0; i < 6; i++) {
    sphere(g, 0.6, C.leaf, (rng() - 0.5) * 2, 3.2 + rng() * 1.2, (rng() - 0.5) * 2)
  }
  return g
}

/** 伊帕齐娅：符号与沉默 */
function ipazia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)
  addPaving(g, 6, C.marble)

  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      const h = 1 + rng() * 2.8
      addHouse(g, 0.95, h, 0.95, x === 0 && z === 0 ? C.vermilion : C.marble, x * 1.2, z * 1.2)
      if (rng() > 0.6) addPerson(g, x * 1.2 + 0.6, z * 1.2, 0, C.cloth)
    }
  }
  for (let i = 0; i < 5; i++) {
    box(g, 2, 1.3, 0.1, C.gold, 0, 2.8 + i * 0.9, -3.2 + i * 1.5, i * 0.3)
  }
  cyl(g, 0.55, 0.55, 4.5, C.ink, 0, 2.2, 0)
  return g
}

/** 奥利维亚：名字可换、石头不变 */
function olivia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)

  for (let i = 0; i < 12; i++) {
    const a = rng() * Math.PI * 2
    const r = 1.2 + rng() * 3.5
    box(g, 1 + rng(), 1.2 + rng() * 2.6, 1, i % 3 === 0 ? C.earth : C.stone, Math.cos(a) * r, 1, Math.sin(a) * r, rng())
  }
  for (let i = 0; i < 7; i++) {
    box(g, 1.2, 0.6, 0.1, C.marble, (rng() - 0.5) * 5, 1.3 + i * 0.65, (rng() - 0.5) * 5, rng() * Math.PI)
    addPerson(g, (rng() - 0.5) * 5, (rng() - 0.5) * 5, rng() * 6, C.cloth)
  }
  box(g, 1.8, 4, 0.55, C.vermilion, 0, 2, 0)
  return g
}

// ═══════════ 轻盈的城市 ═══════════

/** 伊萨乌拉：深渊井城 */
function isaura(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  // 深渊
  cyl(g, 8, 8.5, 0.3, C.ink, 0, -0.5, 0, 40)
  addGround(g, 'stone', 8)

  // 井
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const r = i === 0 ? 0 : 3
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    cyl(g, 1, 1, 3.5, C.marble, x, 1.7, z, 18)
    cyl(g, 0.6, 0.6, 3.8, C.waterDeep, x, 1.6, z, 18)
    sphere(g, 0.35, C.water, x, 2.8, z, { transparent: true, opacity: 0.6 })
  }

  // 桥
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 2.6, 0.12, 0.6, C.gold, Math.cos(a) * 1.5, 3.4, Math.sin(a) * 1.5, a)
    addPerson(g, Math.cos(a) * 1.5, Math.sin(a) * 1.5, a, C.cloth)
  }

  addWaterfall(g, 0, 3, 0.2, 1.8)
  addParticles(g, 30, 5, [0.5, 3], C.water, 0.06, rng)
  return g
}

/** 珍诺比亚：高脚轻城 */
function zenobia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'grass', 12)

  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    const r = 3 + (i % 2) * 1.2
    cyl(g, 0.12, 0.18, 5.8, C.slate, Math.cos(a) * r, 2.9, Math.sin(a) * r, 8)
  }
  for (let i = 0; i < 4; i++) {
    cyl(g, 2.4 + i * 0.85, 2.4 + i * 0.85, 0.22, i === 1 ? C.vermilion : C.marble, 0, 5 + i * 0.65, 0, 28)
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 0.12, 2.2, 1.5, C.marble, Math.cos(a) * 3.4, 5.8, Math.sin(a) * 3.4, a)
    addPerson(g, Math.cos(a) * 2.5, Math.sin(a) * 2.5, a, C.cloth)
  }
  torus(g, 4, 0.1, C.gold, 0, 7.8, 0)
  addParticles(g, 25, 5, [1, 6], C.gold, 0.05, rng)
  return g
}

/** 阿尔米拉：水管森林、仙女沐浴 */
function armilla(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)

  // 水管森林
  for (let i = 0; i < 22; i++) {
    const a = rng() * Math.PI * 2
    const r = 1 + rng() * 5
    const h = 2.5 + rng() * 4
    cyl(g, 0.12, 0.15, h, C.slate, Math.cos(a) * r, h / 2, Math.sin(a) * r, 7)
    // 龙头/喷头
    if (rng() > 0.5) {
      cyl(g, 0.08, 0.08, 0.5, C.metal, Math.cos(a) * r, h, Math.sin(a) * r, 6)
      // 水幕
      const spray = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 1.6),
        new THREE.MeshStandardMaterial({ color: C.water, transparent: true, opacity: 0.45, side: THREE.DoubleSide, flatShading: false })
      )
      spray.position.set(Math.cos(a) * r, h - 0.8, Math.sin(a) * r)
      g.add(spray)
    }
  }

  // 浴缸
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const r = 2.5 + rng() * 2
    box(g, 1.3, 0.55, 0.75, C.marble, Math.cos(a) * r, 2.2 + rng() * 1.2, Math.sin(a) * r, a)
    // 沐浴者
    addPerson(g, Math.cos(a) * r, Math.sin(a) * r, a, C.skin, 0.85)
  }

  // 面盆
  for (let i = 0; i < 4; i++) {
    sphere(g, 0.35, C.marble, (rng() - 0.5) * 6, 3.5 + rng(), (rng() - 0.5) * 6)
  }

  addWaterfall(g, 2, 4, 0.2, 1)
  addParticles(g, 60, 6, [0.5, 4], C.water, 0.07, rng)
  return g
}

/** 索芙洛妮娅：两城轮换 */
function sofronia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)
  cyl(g, 5, 5.2, 0.35, C.stone, 0, 0.18, 0, 32)

  for (let i = 0; i < 7; i++) {
    addHouse(g, 1, 1.4 + rng() * 1.8, 1, C.marble, -2.8 + (i % 3) * 1, -1.2 + Math.floor(i / 3) * 1.1)
    addHouse(g, 1, 1.5 + rng() * 1.6, 1, C.gold, 1.6 + (i % 3) * 1, -1.2 + Math.floor(i / 3) * 1.1)
    addPerson(g, (rng() - 0.5) * 4, (rng() - 0.5) * 3, rng() * 6, C.cloth)
  }
  cyl(g, 0.2, 0.2, 5.5, C.vermilion, 0, 2.7, 0)
  box(g, 3.5, 0.12, 0.12, C.gold, 0, 3.5, 0)
  return g
}

/** 奥克塔维亚：悬空之城、网即地基 */
function ottavia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  // 深渊
  cyl(g, 9, 9.5, 0.25, C.ink, 0, -0.6, 0, 40)

  // 网
  for (let i = -4; i <= 4; i++) {
    line(g, [new THREE.Vector3(-5, 0, i), new THREE.Vector3(5, 0, i)], C.gold, 0.4)
    line(g, [new THREE.Vector3(i, 0, -5), new THREE.Vector3(i, 0, 5)], C.gold, 0.4)
  }

  // 挂在网上的建筑
  for (let i = 0; i < 14; i++) {
    const x = (rng() - 0.5) * 8
    const z = (rng() - 0.5) * 8
    const h = 1.2 + rng() * 2.2
    addHouse(g, 0.8, h, 0.8, C.marble, x, z)
    addPerson(g, x + 0.6, z, rng() * 6, C.cloth)
  }

  // 桥索
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    line(g, [new THREE.Vector3(Math.cos(a) * 5, 0, Math.sin(a) * 5), new THREE.Vector3(Math.cos(a) * 8, 4, Math.sin(a) * 8)], C.slate, 0.35)
  }
  return g
}

// ═══════════ 贸易的城市 ═══════════

/** 欧菲米亚：年度集市 */
function eufemia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'sand', 12)
  addPaving(g, 6, C.stone)

  // 摊位环
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2
    const r = 3.6
    box(g, 1.2, 0.9, 1.2, i % 4 === 0 ? C.vermilion : C.marble, Math.cos(a) * r, 0.55, Math.sin(a) * r, a)
    box(g, 1.4, 0.12, 1.4, C.gold, Math.cos(a) * r, 1.15, Math.sin(a) * r, a)
    addPerson(g, Math.cos(a) * (r - 1), Math.sin(a) * (r - 1), a + Math.PI, C.cloth)
  }

  // 中央交易台
  cyl(g, 1.8, 2, 0.6, C.stone, 0, 0.3, 0, 20)
  cyl(g, 0.35, 0.35, 3, C.wood, 0, 1.8, 0)
  sphere(g, 0.55, C.gold, 0, 3.5, 0, { emissive: C.gold, emissiveIntensity: 0.4 })

  // 货箱
  for (let i = 0; i < 10; i++) {
    box(g, 0.6, 0.6, 0.6, C.wood, (rng() - 0.5) * 6, 0.35, (rng() - 0.5) * 6)
  }
  addCrowd(g, 16, 5, rng)
  return g
}

/** 克洛埃：目光交错 */
function chloe(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)
  box(g, 5, 0.08, 9, C.marble, 0, 0.05, 0)

  for (let i = 0; i < 7; i++) {
    addHouse(g, 1.4, 2.2 + rng() * 2.2, 1.4, C.marble, -3.5, -3.5 + i * 1.15)
    addHouse(g, 1.4, 2.2 + rng() * 2.2, 1.4, C.gold, 3.5, -3.5 + i * 1.15)
    addPerson(g, -2, -3.5 + i * 1.15, 0, C.cloth)
    addPerson(g, 2, -3.5 + i * 1.15, Math.PI, C.cloth)
    // 目光线
    line(g, [new THREE.Vector3(-2.5, 1.6 + i * 0.35, -3.5 + i * 1.15), new THREE.Vector3(2.5, 1.6 + i * 0.35, -3.5 + i * 1.15)], i === 3 ? C.vermilion : C.gold, 0.35)
  }
  return g
}

/** 欧特罗皮亚：角色轮换 */
function eutropia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)
  addPaving(g, 5, C.marble)

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const h = 1.5 + (i % 3) * 0.9
    addHouse(g, 1.3, h, 1.3, i % 3 === 0 ? C.vermilion : C.marble, Math.cos(a) * 4, Math.sin(a) * 4, a)
    box(g, 0.9, 0.12, 0.12, C.gold, Math.cos(a) * 2.5, 1.7, Math.sin(a) * 2.5, a)
  }

  cyl(g, 1.5, 1.6, 0.5, C.stone, 0, 0.25, 0, 20)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    addPerson(g, Math.cos(a) * 1, Math.sin(a) * 1, a, [C.vermilion, C.gold, C.slate, C.wood, C.ink][i])
  }
  addCrowd(g, 10, 5, rng)
  return g
}

/** 埃尔西莉亚：以线定义之城 */
function ersilia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'grass', 12)

  const nodes: THREE.Vector3[] = []
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    const r = 1.5 + rng() * 3.8
    const p = new THREE.Vector3(Math.cos(a) * r, 1.2 + rng() * 3, Math.sin(a) * r)
    nodes.push(p)
    sphere(g, 0.35, i === 0 ? C.vermilion : C.marble, p.x, p.y, p.z)
    // 支柱
    cyl(g, 0.1, 0.1, p.y, C.wood, p.x, p.y / 2, p.z, 6)
    addPerson(g, p.x + 0.5, p.z, rng() * 6, C.cloth)
  }
  // 关系线
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (rng() > 0.45) continue
      const col = [C.gold, C.ink, C.marble, C.slate][(i + j) % 4]
      line(g, [nodes[i], nodes[j]], col, 0.4)
    }
  }
  addShadowDisc(g, 6)
  return g
}

/** 斯梅拉尔迪娜：水道两岸 */
function smeraldina(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)
  addRiver(g, 2.2, 11)

  for (let i = 0; i < 9; i++) {
    addHouse(g, 1.2, 1.6 + rng() * 2, 1.2, C.marble, -4.5 + i * 1.15, -2.4)
    addHouse(g, 1.2, 1.6 + rng() * 2, 1.2, C.gold, -4.5 + i * 1.15, 2.4)
    addPerson(g, -4.5 + i * 1.15, -1.5, 0, C.cloth)
    addPerson(g, -4.5 + i * 1.15, 1.5, Math.PI, C.cloth)
  }

  for (let i = -1; i <= 1; i++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.14, 8, 18, Math.PI), soft(C.gold))
    arch.position.set(i * 3.2, 1.25, 0)
    g.add(arch)
    box(g, 2.8, 0.14, 0.55, C.marble, i * 3.2, 1.95, 0)
    addPerson(g, i * 3.2, 0, Math.PI / 2, C.cloth)
  }

  // 船
  box(g, 1, 0.24, 0.4, C.wood, 1.5, 0.22, 0)
  addPerson(g, 1.5, 0, 0, C.vermilion, 0.8)
  box(g, 1, 0.24, 0.4, C.wood, -2.2, 0.22, 0.3)
  return g
}

// ═══════════ 城市与眼睛 ═══════════

/** 瓦尔德拉达：湖面倒影双生 */
function valdrada(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addLake(g, 7)

  // 上层城市
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r = 1.8 + rng() * 3
    addHouse(g, 0.9, 1.6 + rng() * 2.2, 0.9, C.marble, Math.cos(a) * r, Math.sin(a) * r)
    addPerson(g, Math.cos(a) * r + 0.5, Math.sin(a) * r, rng() * 6, C.cloth)
  }
  addTower(g, 0.55, 4.5, C.vermilion, 0, 0)
  addGlow(g, 0, 4.8, 0, C.gold, 1, 8)

  // 倒影（半透明）
  const reflect = g.clone()
  reflect.scale.y = -1
  reflect.position.y = -0.12
  reflect.traverse((obj) => {
    const m = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
    if (m) {
      m.transparent = true
      m.opacity = 0.28
    }
    if ((obj as THREE.DirectionalLight).isLight) {
      ;(obj as THREE.DirectionalLight).intensity = 0
    }
    if ((obj as THREE.HemisphereLight).isLight) {
      ;(obj as THREE.HemisphereLight).intensity = 0
    }
    if ((obj as THREE.PointLight).isLight) {
      ;(obj as THREE.PointLight).intensity = 0
    }
  })
  g.add(reflect as THREE.Object3D)
  return g
}

/** 泽姆鲁德：俯瞰/仰望 */
function zemrude(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)

  // 下层井状
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    cyl(g, 1, 1, 2.4, C.earth, Math.cos(a) * 3, 1.2, Math.sin(a) * 3, 10)
    cyl(g, 0.55, 0.55, 2.6, C.ink, Math.cos(a) * 3, 1.1, Math.sin(a) * 3, 10)
    addPerson(g, Math.cos(a) * 3, Math.sin(a) * 3, a, C.cloth)
  }
  // 上层云端
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5
    sphere(g, 0.8, C.marble, Math.cos(a) * 2.6, 3.8 + (i % 2) * 0.6, Math.sin(a) * 2.6)
    box(g, 0.65, 1, 0.65, C.gold, Math.cos(a) * 2.6, 3.3, Math.sin(a) * 2.6)
  }
  torus(g, 3.6, 0.08, C.vermilion, 0, 2.8, 0)
  return g
}

/** 鲍西斯：高脚城与影子 */
function bauci(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'grass', 10)

  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    const r = 2.4 + (i % 2) * 1.3
    cyl(g, 0.08, 0.12, 7.2, C.slate, Math.cos(a) * r, 3.6, Math.sin(a) * r, 7)
  }
  // 顶部平台
  cyl(g, 3.2, 3.2, 0.28, C.marble, 0, 7, 0, 28)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    addHouse(g, 0.8, 1 + rng() * 1.3, 0.8, i === 2 ? C.vermilion : C.marble, Math.cos(a) * 2, Math.sin(a) * 2)
    addPerson(g, Math.cos(a) * 2 + 0.5, Math.sin(a) * 2, a, C.cloth)
  }

  // 地面影子城
  addShadowDisc(g, 3.2, 0, 0, 0.18)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 0.7, 0.35, 0.7, C.ink, Math.cos(a) * 2, 0.22, Math.sin(a) * 2)
  }
  return g
}

/** 菲莉德：凝视之城 */
function fillide(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)

  for (let i = 0; i < 4; i++) {
    torus(g, 1.8 + i * 1.2, 0.1, i === 1 ? C.vermilion : C.slate, 0, 2.4, 0, Math.PI / 2.4)
  }
  sphere(g, 0.95, C.ink, 0, 2.4, 0)
  sphere(g, 0.4, C.gold, 0, 2.4, 0.85, { emissive: C.gold, emissiveIntensity: 0.5 })

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    addHouse(g, 0.85, 1.7, 0.85, C.marble, Math.cos(a) * 4.2, Math.sin(a) * 4.2, a)
    addPerson(g, Math.cos(a) * 3.6, Math.sin(a) * 3.6, a + Math.PI, C.cloth)
    line(g, [new THREE.Vector3(Math.cos(a) * 3.6, 1.6, Math.sin(a) * 3.6), new THREE.Vector3(0, 2.4, 0)], C.gold, 0.22)
  }
  return g
}

/** 莫里亚娜：正面金碧、背面水管 */
function moriana(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)

  // 正面
  for (let i = 0; i < 7; i++) {
    addHouse(g, 1.4, 2 + rng() * 1.8, 0.6, C.gold, -4 + i * 1.35, -1.4)
    sphere(g, 0.3, C.vermilion, -4 + i * 1.35, 3.2 + rng(), -1.4)
    addPerson(g, -4 + i * 1.35, -0.5, 0, C.cloth)
  }
  box(g, 9.5, 0.2, 0.8, C.vermilion, 0, 3.4, -1.4)
  addGlow(g, -2, 3, -1, C.gold, 0.6, 8)
  addGlow(g, 2, 3, -1, C.gold, 0.6, 8)

  // 背面
  for (let i = 0; i < 7; i++) {
    cyl(g, 0.12, 0.12, 2.6, C.slate, -4 + i * 1.35, 1.3, 1.4, 8)
    line(g, [new THREE.Vector3(-4 + i * 1.35, 2.4, 1.4), new THREE.Vector3(-4 + i * 1.35, 2.4, 3.2)], C.ink, 0.4)
    box(g, 0.6, 0.5, 0.5, C.rust, -4 + i * 1.35, 0.3, 2.2)
  }

  // 分界
  box(g, 9.5, 3.5, 0.1, C.ink, 0, 1.75, 0)
  return g
}

// ═══════════ 城市与名字 ═══════════

/** 阿格劳拉：说出的与砌进墙的语言 */
function aglaura(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 2.4, 3.5, 0.4, C.stone, Math.cos(a) * 3.5, 1.75, Math.sin(a) * 3.5, a)
  }
  for (let i = 0; i < 12; i++) {
    box(g, 0.95, 0.42, 0.08, i % 3 === 0 ? C.vermilion : C.marble, (rng() - 0.5) * 5, 1.3 + rng() * 3, (rng() - 0.5) * 5, rng() * Math.PI)
  }
  cyl(g, 0.4, 0.4, 4.5, C.wood, 0, 2.2, 0)
  addCrowd(g, 8, 3, rng)
  return g
}

/** 莱安德拉：被管理的名字 */
function leandra(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 10)

  for (let i = 0; i < 7; i++) {
    box(g, 0.28, 4.5, 2.6, C.marble, -3.2 + i * 1.1, 2.25, 0)
    for (let j = 0; j < 5; j++) {
      box(g, 0.08, 0.38, 2, j === 2 ? C.vermilion : C.gold, -3.2 + i * 1.1, 0.9 + j * 0.75, 0)
    }
    addPerson(g, -3.2 + i * 1.1, 1.5, 0, C.cloth)
  }
  box(g, 7, 0.2, 0.55, C.vermilion, 0, 4.8, 0)
  return g
}

/** 皮拉：刻在石上的名字 */
function pirra(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'sand', 11)

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r = 2 + rng() * 2.5
    const h = 2.2 + rng() * 3
    box(g, 1.2, h, 0.4, i === 3 ? C.vermilion : C.stone, Math.cos(a) * r, h / 2, Math.sin(a) * r, a)
    for (let j = 0; j < 3; j++) {
      box(g, 0.8, 0.1, 0.05, C.ink, Math.cos(a) * r, 0.9 + j * 0.75, Math.sin(a) * r + 0.22, a)
    }
    addPerson(g, Math.cos(a) * r + 0.8, Math.sin(a) * r, a, C.cloth)
  }
  sphere(g, 1.2, C.marble, 0, 1.2, 0)
  return g
}

/** 克拉莉丝：旧名字上的新城 */
function clarice(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'earth', 11)

  for (let i = 0; i < 14; i++) {
    const a = rng() * Math.PI * 2
    const r = 1 + rng() * 4
    box(g, 0.9 + rng(), 0.55 + rng() * 0.5, 0.9, C.earth, Math.cos(a) * r, 0.35, Math.sin(a) * r, rng())
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    addHouse(g, 0.95, 1.8 + rng() * 2.2, 0.95, C.marble, Math.cos(a) * 2.6, Math.sin(a) * 2.6, a)
    addPerson(g, Math.cos(a) * 2.6 + 0.6, Math.sin(a) * 2.6, a, C.cloth)
  }
  box(g, 2, 0.95, 0.18, C.vermilion, 0, 4, 0)
  return g
}

/** 伊蕾妮：远看是城、近看是「差不多」 */
function irene(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)

  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    addTower(g, 0.6, 3.4 + (i % 2) * 0.35, C.marble, Math.cos(a) * 3, Math.sin(a) * 3)
    addPerson(g, Math.cos(a) * 3 + 0.8, Math.sin(a) * 3, a, C.cloth)
  }
  addTower(g, 0.7, 4, C.vermilion, 0, 0)
  addGlow(g, 0, 4.3, 0, C.gold, 1, 8)
  torus(g, 4.5, 0.08, C.gold, 0, 2.2, 0)
  return g
}

// ═══════════ 城市与死亡 ═══════════

/** 梅拉尼亚：角色循环 */
function melania(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)
  cyl(g, 4.8, 5, 0.35, C.stone, 0, 0.18, 0, 32)

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const h = 1.8 + rng() * 1.2
    addHouse(g, 0.85, h, 0.85, i % 5 === 0 ? C.vermilion : C.marble, Math.cos(a) * 3.6, Math.sin(a) * 3.6, a)
    sphere(g, 0.32, C.gold, Math.cos(a) * 3.6, h + 0.35, Math.sin(a) * 3.6)
    addPerson(g, Math.cos(a) * 2.6, Math.sin(a) * 2.6, a, C.cloth)
  }
  cyl(g, 1.5, 1.5, 0.45, C.wood, 0, 0.25, 0, 20)
  torus(g, 2, 0.1, C.vermilion, 0, 0.7, 0)
  return g
}

/** 阿德尔玛：死者面孔 */
function adelma(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)
  cyl(g, 4.5, 4, 1.4, C.stone, 0, 0.7, 0, 32)

  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2
    sphere(g, 0.4, i % 4 === 0 ? C.vermilion : C.marble, Math.cos(a) * 3.8, 1.25, Math.sin(a) * 3.8)
    addPerson(g, Math.cos(a) * 2.8, Math.sin(a) * 2.8, a + Math.PI, C.cloth)
  }
  addTower(g, 0.6, 3.8, C.wood, 0, 0)
  addGlow(g, 0, 4.2, 0, C.gold, 0.9, 8)

  for (let i = 0; i < 4; i++) {
    cyl(g, 3.4 - i * 0.55, 3.4 - i * 0.55, 0.3, C.marble, 0, 1.4 + i * 0.35, 0, 28)
  }
  return g
}

/** 欧萨皮亚：地上地下城 */
function eusapia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)

  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    addHouse(g, 1, 1.8 + rng() * 1.8, 1, C.marble, Math.cos(a) * 3, Math.sin(a) * 3, a)
    addPerson(g, Math.cos(a) * 3 + 0.7, Math.sin(a) * 3, a, C.cloth)
    // 地下镜像
    box(g, 1, 1.6 + rng(), 1, C.earth, Math.cos(a) * 3, -1, Math.sin(a) * 3, a, {
      transparent: true,
      opacity: 0.45,
    })
  }
  cyl(g, 0.35, 0.35, 5.5, C.vermilion, 0, 0, 0)
  addGlow(g, 0, -1.5, 0, C.gold, 0.6, 6)
  return g
}

/** 阿尔吉亚：尘土之城 */
function argia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  // 土
  const earth = new THREE.Mesh(new THREE.CylinderGeometry(9, 9.5, 2.2, 40), soft(C.earth))
  earth.position.y = -0.9
  g.add(earth)

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const r = i === 0 ? 0 : 2.8
    const h = 1.6 + rng() * 1.8
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2, h, 10), soft(C.earth))
    cone.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r)
    cone.castShadow = true
    g.add(cone)
    // 地下轮廓
    box(g, 0.95, 1.3, 0.95, C.ink, Math.cos(a) * r, -1.2, Math.sin(a) * r, a, {
      transparent: true,
      opacity: 0.55,
    })
  }
  addShadowDisc(g, 5, 0, 0, 0.2)
  return g
}

/** 劳多米亚：活人城与死人城 */
function laudomia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 13)

  for (let i = 0; i < 7; i++) {
    addHouse(g, 1, 2 + rng() * 2, 1, C.marble, -3.8 + (i % 3) * 1.2, -1.2 + Math.floor(i / 3) * 1.5)
    sphere(g, 0.28, C.gold, -3.8 + (i % 3) * 1.2, 2.6 + rng(), -1.2 + Math.floor(i / 3) * 1.5)
    addPerson(g, -3.8 + (i % 3) * 1.2 + 0.5, -1.2 + Math.floor(i / 3) * 1.5, 0, C.cloth)
  }
  for (let i = 0; i < 7; i++) {
    addHouse(g, 1, 1.5 + rng() * 1.5, 1, C.earth, 1.4 + (i % 3) * 1.2, -1.2 + Math.floor(i / 3) * 1.5)
  }
  box(g, 0.14, 3.8, 6.5, C.vermilion, -0.7, 1.9, 0)
  box(g, 9, 0.15, 6, C.stone, 0, 0.08, 0)
  return g
}

// ═══════════ 城市与天空 ═══════════

/** 欧多西亚：地毯上的天意 */
function eudossia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)

  // 地毯
  box(g, 10, 0.12, 8, C.vermilion, 0, 0.06, 0)
  box(g, 8.5, 0.1, 6.5, C.gold, 0, 0.15, 0)
  box(g, 6.5, 0.1, 4.5, C.marble, 0, 0.24, 0)

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    addHouse(g, 0.85, 1.5 + rng() * 1.8, 0.85, C.stone, Math.cos(a) * 3, Math.sin(a) * 2.5)
    addPerson(g, Math.cos(a) * 3 + 0.6, Math.sin(a) * 2.5, a, C.cloth)
  }

  // 星图
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    sphere(g, 0.24, C.gold, Math.cos(a) * 1.5, 2, Math.sin(a) * 1.5, {
      emissive: C.gold,
      emissiveIntensity: 0.45,
    })
    line(g, [new THREE.Vector3(Math.cos(a) * 1.5, 2, Math.sin(a) * 1.5), new THREE.Vector3(0, 2, 0)], C.gold, 0.35)
  }
  return g
}

/** 贝尔萨贝亚：天上城与尘世 */
function bersabea(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'sand', 11)

  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    addHouse(g, 0.9, 1.5, 0.9, C.marble, Math.cos(a) * 2, Math.sin(a) * 2)
    sphere(g, 0.38, C.gold, Math.cos(a) * 2, 6, Math.sin(a) * 2)
    box(g, 0.85, 1.4, 0.85, C.gold, Math.cos(a) * 2, 5.4, Math.sin(a) * 2, a)
  }
  torus(g, 2.8, 0.12, C.gold, 0, 5.2, 0)
  addGlow(g, 0, 6, 0, C.gold, 1, 10)

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    addHouse(g, 0.65, 0.85 + rng() * 0.5, 0.65, C.stone, Math.cos(a) * 3.6, Math.sin(a) * 3.6)
    addPerson(g, Math.cos(a) * 3.6 + 0.5, Math.sin(a) * 3.6, a, C.cloth)
    line(g, [new THREE.Vector3(Math.cos(a) * 2, 4.8, Math.sin(a) * 2), new THREE.Vector3(Math.cos(a) * 3.4, 1.2, Math.sin(a) * 3.4)], C.slate, 0.22)
  }
  return g
}

/** 泰克拉：永远在开工 */
function tecla(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'earth', 11)

  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2
    const r = 3
    const h = 1.2 + rng() * 3.4
    cyl(g, 0.22, 0.28, h, C.marble, Math.cos(a) * r, h / 2, Math.sin(a) * r)
    addScaffold(g, Math.cos(a) * r, h, Math.sin(a) * r, 1, 1.4, 1)
    addPerson(g, Math.cos(a) * (r - 1), Math.sin(a) * (r - 1), a, C.cloth)
  }
  for (let i = 0; i < 6; i++) {
    cyl(g, 1.15 - i * 0.13, 1.15 - i * 0.13, 0.32, i === 3 ? C.vermilion : C.stone, 0, i * 0.72, 0, 20)
    addScaffold(g, 0, i * 0.72, 0, 1.4, 0.8, 1.4)
  }
  torus(g, 4.2, 0.07, C.slate, 0, 4.8, 0)
  // 星空蓝图
  addParticles(g, 40, 8, [4, 7], C.gold, 0.07, rng)
  return g
}

/** 佩林齐亚：天与地之间 */
function perinzia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 11)
  box(g, 8, 0.1, 2.5, C.stone, 0, 0.05, 0)

  for (let i = 0; i < 7; i++) {
    addHouse(g, 1.1, 1.3 + rng(), 1.1, C.marble, -3.6 + i * 1.2, -1.8)
    addHouse(g, 1.1, 1.3 + rng(), 1.1, C.marble, -3.6 + i * 1.2, 1.8)
    addPerson(g, -3.6 + i * 1.2, 0, 0, C.cloth)
  }

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    sphere(g, 0.6, C.marble, Math.cos(a) * 2.5, 3.8, Math.sin(a) * 2.5)
    line(g, [new THREE.Vector3(Math.cos(a) * 2.5, 3.2, Math.sin(a) * 2.5), new THREE.Vector3(0, 2.2, 0)], C.gold, 0.3)
  }
  torus(g, 3.4, 0.16, C.slate, 0, 2.4, 0)
  return g
}

/** 安德里亚：按星辰排列 */
function andria(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)
  addPaving(g, 6, C.marble)

  const stars: THREE.Vector3[] = []
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const r = 3.6
    const p = new THREE.Vector3(Math.cos(a) * r, 0.28, Math.sin(a) * r)
    stars.push(p)
    sphere(g, 0.24, C.gold, p.x, p.y, p.z, { emissive: C.gold, emissiveIntensity: 0.4 })
  }
  for (let i = 0; i < 8; i++) {
    addHouse(g, 0.85, 1.6 + (i % 3) * 0.85, 0.85, i === 2 ? C.vermilion : C.marble, stars[i].x, stars[i].z, (i / 8) * Math.PI * 2)
    addPerson(g, stars[i].x + 0.6, stars[i].z, 0, C.cloth)
    line(g, [stars[i], stars[(i + 1) % stars.length]], C.slate, 0.3)
    line(g, [stars[i], new THREE.Vector3(0, 0.28, 0)], C.gold, 0.18)
  }
  addTower(g, 0.4, 3.5, C.stone, 0, 0)
  torus(g, 1.2, 0.09, C.gold, 0, 3.5, 0, 0)
  addGlow(g, 0, 3.6, 0, C.gold, 0.8, 8)
  return g
}

// ═══════════ 连绵的城市 ═══════════

/** 莱奥尼亚：每日丢弃 */
function leonia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    addHouse(g, 1.05, 2 + rng() * 2, 1.05, C.marble, Math.cos(a) * 2.8, Math.sin(a) * 2.8, a)
    sphere(g, 0.3, C.marble, Math.cos(a) * 2.8, 2.5 + rng(), Math.sin(a) * 2.8)
    addPerson(g, Math.cos(a) * 2.8 + 0.7, Math.sin(a) * 2.8, a, C.cloth)
  }

  // 垃圾山边界
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    box(g, 0.65 + rng() * 0.5, 0.4 + rng() * 0.6, 0.65, i % 3 === 0 ? C.vermilion : C.rust, Math.cos(a) * 5, 0.35, Math.sin(a) * 5, rng())
  }
  cyl(g, 1.7, 1.7, 0.3, C.gold, 0, 0.18, 0, 24)
  return g
}

/** 特鲁德：所有城都一样 */
function trude(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)

  for (let x = -3; x <= 3; x++) {
    for (let z = -3; z <= 3; z++) {
      addHouse(g, 0.85, 1.7, 0.85, C.marble, x * 1.35, z * 1.35)
    }
  }
  box(g, 9.5, 0.1, 0.6, C.vermilion, 0, 0.05, 0)
  box(g, 0.6, 0.1, 9.5, C.vermilion, 0, 0.05, 0)

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    addTower(g, 0.4, 3.5, C.marble, Math.cos(a) * 3.5, Math.sin(a) * 3.5)
    addPerson(g, Math.cos(a) * 3.5 + 0.6, Math.sin(a) * 3.5, a, C.cloth)
  }
  return g
}

/** 普罗科皮亚：人口密度 */
function procopia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)

  for (let i = 0; i < 36; i++) {
    const x = (rng() - 0.5) * 8
    const z = (rng() - 0.5) * 8
    const h = 0.8 + rng() * 3.4
    box(g, 0.65, h, 0.65, i % 5 === 0 ? C.vermilion : C.marble, x, h / 2, z)
  }
  for (let i = 0; i < 20; i++) {
    addPerson(g, (rng() - 0.5) * 8, (rng() - 0.5) * 8, rng() * 6, C.cloth, 0.85 + rng() * 0.25)
  }
  torus(g, 2.2, 0.1, C.gold, 0, 1.4, 0)
  torus(g, 3.6, 0.1, C.gold, 0, 1.4, 0)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 0.5, 2.6, 0.5, C.wood, Math.cos(a) * 1, 1.3, Math.sin(a) * 1)
  }
  return g
}

/** 切奇莉亚：河流分段 */
function cecilia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'grass', 12)
  addRiver(g, 2, 11)

  for (let seg = -2; seg <= 2; seg++) {
    for (let i = 0; i < 5; i++) {
      addHouse(g, 0.9, 1.3 + rng() * 1.8, 0.9, seg === 0 ? C.vermilion : C.marble, seg * 2, -2.6 + i * 1.15)
      addHouse(g, 0.9, 1.3 + rng() * 1.8, 0.9, C.gold, seg * 2, 1.2 + i * 1.15)
      addPerson(g, seg * 2 + 0.5, -2 + i * 1.15, 0, C.cloth)
    }
    box(g, 2, 0.14, 0.65, C.gold, seg * 2, 1.5, 0)
    addPerson(g, seg * 2, 0, Math.PI / 2, C.cloth)
  }
  return g
}

/** 潘忒西莱亚：新旧缠绕 */
function penthesilea(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'earth', 12)

  for (let i = 0; i < 12; i++) {
    const a = rng() * Math.PI * 2
    const r = 1 + rng() * 3.8
    box(g, 0.9 + rng() * 0.5, 0.55 + rng() * 0.8, 0.9, C.earth, Math.cos(a) * r, 0.35, Math.sin(a) * r, rng())
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    addHouse(g, 0.85, 1.7 + rng() * 2.3, 0.85, C.marble, Math.cos(a) * 2.9, Math.sin(a) * 2.9, a)
    addPerson(g, Math.cos(a) * 2.9 + 0.6, Math.sin(a) * 2.9, a, C.cloth)
  }
  for (let i = 0; i < 6; i++) {
    const pts: THREE.Vector3[] = []
    for (let j = 0; j < 12; j++) {
      const t = j / 11
      const a = t * Math.PI * 3 + i
      const r = 1.2 + t * 2.8
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0.4 + t * 2.4, Math.sin(a) * r))
    }
    line(g, pts, i === 2 ? C.vermilion : C.gold, 0.38)
  }
  return g
}

// ═══════════ 隐蔽的城市 ═══════════

/** 奥琳达：递归生长的城 */
function olinda(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'grass', 12)

  for (let i = 0; i < 5; i++) {
    const s = 7 - i * 1.15
    const y = i * 0.72
    const color = i === 2 ? C.vermilion : C.marble
    box(g, s, 0.72, 0.2, color, 0, y + 0.36, -s / 2)
    box(g, s, 0.72, 0.2, color, 0, y + 0.36, s / 2)
    box(g, 0.2, 0.72, s, color, -s / 2, y + 0.36, 0)
    box(g, 0.2, 0.72, s, color, s / 2, y + 0.36, 0)

    // 环上屋顶/天线/水池
    if (i < 4) {
      addHouse(g, 0.6, 0.7, 0.6, C.marble, s / 2 - 0.6, y + 0.7, -s / 2 + 0.6)
      cyl(g, 0.04, 0.04, 0.8, C.ink, s / 2 - 1, y + 1.2, -s / 2 + 1, 5)
    }
    addPerson(g, s / 2 - 1, y + 0.7, 0, C.cloth)
    addPerson(g, -s / 2 + 1, y + 0.7, Math.PI, C.cloth)
  }
  sphere(g, 0.55, C.gold, 0, 4, 0, { emissive: C.gold, emissiveIntensity: 0.5 })
  addGlow(g, 0, 4, 0, C.gold, 0.9, 8)
  return g
}

/** 拉伊萨：不幸中隐藏的幸福 */
function raissa(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'earth', 11)

  for (let i = 0; i < 14; i++) {
    const a = rng() * Math.PI * 2
    const r = 1 + rng() * 3.8
    box(g, 1, 1.3 + rng() * 1.7, 1, C.earth, Math.cos(a) * r, 0.85, Math.sin(a) * r, rng())
    addPerson(g, Math.cos(a) * r, Math.sin(a) * r, rng() * 6, C.cloth)
  }
  // 隐藏光点
  for (let i = 0; i < 10; i++) {
    sphere(g, 0.2, C.gold, (rng() - 0.5) * 6, 1.2 + rng() * 3, (rng() - 0.5) * 6, {
      emissive: C.gold,
      emissiveIntensity: 0.5,
    })
    addGlow(g, (rng() - 0.5) * 6, 1.5, (rng() - 0.5) * 6, C.gold, 0.35, 4)
  }
  sphere(g, 0.38, C.vermilion, 0, 2.4, 0, { emissive: C.vermilion, emissiveIntensity: 0.3 })
  return g
}

/** 马罗齐亚：树根与屋顶 */
function marozia(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'grass', 11)

  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    addHouse(g, 0.95, 1.7, 0.95, C.marble, Math.cos(a) * 2.6, Math.sin(a) * 2.6, a)
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.75, 4), soft(C.vermilion))
    roof.position.set(Math.cos(a) * 2.6, 2.05, Math.sin(a) * 2.6)
    roof.rotation.y = Math.PI / 4
    g.add(roof)
    addPerson(g, Math.cos(a) * 2.6 + 0.6, Math.sin(a) * 2.6, a, C.cloth)
  }
  // 根系
  for (let i = 0; i < 12; i++) {
    const a = rng() * Math.PI * 2
    const r = 0.6 + rng() * 3.2
    line(g, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * r, -1.8 - rng(), Math.sin(a) * r)], C.wood, 0.4)
    sphere(g, 0.22, C.wood, Math.cos(a) * r, -1.5 - rng(), Math.sin(a) * r)
  }
  // 树
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4
    addTree(g, Math.cos(a) * 4.2, Math.sin(a) * 4.2, 2.4)
  }
  return g
}

/** 泰奥多拉：变形动物寄生 */
function teodora(rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'grass', 11)

  for (let i = 0; i < 5; i++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.8 + i * 0.6, 0.13, 8, 18, Math.PI), soft(C.marble))
    arch.position.set(0, 1.25 + i * 0.38, -1.6 + i * 0.95)
    g.add(arch)
    addPerson(g, 0, -1.6 + i * 0.95, 0, C.cloth)
  }
  for (let i = 0; i < 8; i++) {
    const a = rng() * Math.PI * 2
    const r = 1 + rng() * 3.2
    box(g, 0.8, 0.55 + rng() * 0.5, 1.2, i === 2 ? C.vermilion : C.earth, Math.cos(a) * r, 0.5, Math.sin(a) * r, rng())
    sphere(g, 0.3, C.wood, Math.cos(a) * r, 1.15, Math.sin(a) * r)
  }
  for (let i = 0; i < 5; i++) {
    addHouse(g, 0.6, 1.5, 0.6, C.marble, (rng() - 0.5) * 5, (rng() - 0.5) * 5)
  }
  return g
}

/** 贝蕾妮丝：公正之城的隐藏不义 */
function berenice(_rng: Rng): THREE.Group {
  const g = new THREE.Group()
  addSunLight(g)
  addGround(g, 'stone', 12)
  cyl(g, 3.5, 3.5, 0.3, C.marble, 0, 0.15, 0, 32)

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    addColumn(g, 0.28, 3.4, C.marble, Math.cos(a) * 3.2, 0, Math.sin(a) * 3.2)
    sphere(g, 0.32, C.gold, Math.cos(a) * 3.2, 3.7, Math.sin(a) * 3.2)
    addPerson(g, Math.cos(a) * 2.2, Math.sin(a) * 2.2, a + Math.PI, C.cloth)
  }
  // 地下扭曲
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    box(g, 0.8, 1.3, 0.8, C.ink, Math.cos(a) * 2.6, -1, Math.sin(a) * 2.6, a + 0.8, {
      transparent: true,
      opacity: 0.55,
    })
  }
  // 天平（不对称）
  cyl(g, 0.15, 0.15, 2.4, C.vermilion, 0, 1.2, 0)
  box(g, 3.4, 0.12, 0.12, C.gold, 0.65, 2.6, 0)
  sphere(g, 0.3, C.vermilion, 2, 2.35, 0)
  sphere(g, 0.18, C.gold, -0.7, 2.5, 0)
  addGlow(g, 0, 2.8, 0, C.gold, 0.5, 6)
  return g
}

// ── 注册表 ───────────────────────────────

export const CITY_BUILDERS: Record<string, (rng: Rng) => THREE.Group> = {
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
  const rng = mulberry32(seed * 7919 + 31)
  const root = builder ? builder(rng) : new THREE.Group()

  // 归一化：整体缩放到约 12 单位，并垂直居中
  const box = new THREE.Box3().setFromObject(root)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const scale = 12 / maxDim
  const wrapper = new THREE.Group()
  root.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
  root.scale.setScalar(scale)
  wrapper.add(root)
  return wrapper
}
