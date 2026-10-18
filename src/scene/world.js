import * as THREE from 'three'

/**
 * 纸感光域：柔和半球光 + 单向暖侧光 + 雾 + 背景球
 */
export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0xf0ebe0, 0.0095)

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    400
  )
  camera.position.set(0, 8, 42)

  // 柔和半球光 — 纸白上空 / 暖地下
  const hemi = new THREE.HemisphereLight(0xfff6e8, 0xd8cfc0, 1.15)
  scene.add(hemi)

  // 主暖侧光（模拟窗光）
  const key = new THREE.DirectionalLight(0xffe8d0, 1.35)
  key.position.set(28, 42, 18)
  scene.add(key)

  // 冷补光 — 给线框一点青灰
  const fill = new THREE.DirectionalLight(0xb8c8d4, 0.55)
  fill.position.set(-24, 18, -12)
  scene.add(fill)

  // 极弱顶光 — 提亮雕塑顶部
  const rim = new THREE.DirectionalLight(0xfff0dd, 0.4)
  rim.position.set(0, 60, -30)
  scene.add(rim)

  // 背景渐变球（内表面）
  const bgGeo = new THREE.SphereGeometry(180, 32, 24)
  const bgMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      cTop: { value: new THREE.Color(0xf7f3ea) },
      cMid: { value: new THREE.Color(0xefe8da) },
      cBot: { value: new THREE.Color(0xe4d9c8) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 cTop;
      uniform vec3 cMid;
      uniform vec3 cBot;
      varying vec3 vWorld;
      void main() {
        float h = normalize(vWorld).y * 0.5 + 0.5;
        vec3 col = mix(cBot, cMid, smoothstep(0.0, 0.55, h));
        col = mix(col, cTop, smoothstep(0.55, 1.0, h));
        // 极淡暖噪
        float n = fract(sin(dot(vWorld.xy, vec2(12.9898, 78.233))) * 43758.5453);
        col += (n - 0.5) * 0.012;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
  const bg = new THREE.Mesh(bgGeo, bgMat)
  bg.frustumCulled = false
  scene.add(bg)

  // 地面光斑 — 给雕塑一个「落地」的暗示（极淡）
  const groundGeo = new THREE.CircleGeometry(90, 64)
  const groundMat = new THREE.MeshBasicMaterial({
    color: 0xf2ebe0,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -2.2
  scene.add(ground)

  // 极淡同心环 — 图集网格感
  const ringGroup = new THREE.Group()
  for (let i = 1; i <= 5; i++) {
    const r = 12 + i * 11
    const curve = new THREE.EllipseCurve(0, 0, r, r * 0.42, 0, Math.PI * 2)
    const pts = curve.getPoints(128)
    const geo = new THREE.BufferGeometry().setFromPoints(
      pts.map((p) => new THREE.Vector3(p.x, -2.15, p.y))
    )
    const mat = new THREE.LineBasicMaterial({
      color: 0xc4b8a0,
      transparent: true,
      opacity: 0.1 - i * 0.014,
    })
    ringGroup.add(new THREE.LineLoop(geo, mat))
  }
  scene.add(ringGroup)

  // 漂浮微粒 — 纸尘
  const dustCount = 280
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 120
    dustPos[i * 3 + 1] = Math.random() * 36 - 4
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 90
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({
    color: 0xc4a574,
    size: 0.12,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    sizeAttenuation: true,
  })
  const dust = new THREE.Points(dustGeo, dustMat)
  scene.add(dust)

  // 灯光缓动目标
  const lightTarget = {
    keyPos: new THREE.Vector3(28, 42, 18),
    fogDensity: 0.0095,
    exposure: 1.05,
  }

  function onResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  window.addEventListener('resize', onResize)

  function render() {
    // 微尘缓慢漂移
    dust.rotation.y += 0.00035
    dust.position.y = Math.sin(performance.now() * 0.00012) * 0.4

    renderer.toneMappingExposure += (lightTarget.exposure - renderer.toneMappingExposure) * 0.04
    scene.fog.density += (lightTarget.fogDensity - scene.fog.density) * 0.04

    renderer.render(scene, camera)
  }

  return {
    scene,
    camera,
    renderer,
    render,
    lightTarget,
    onResize,
    dispose() {
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    },
  }
}
