/**
 * 程序化环境音 — Web Audio API，零外部资源
 * 风 / 水 / 集市 / 星空 / 静默，按城市主题切换
 */

export type Soundscape =
  | 'none'
  | 'wind'
  | 'water'
  | 'market'
  | 'celestial'
  | 'underground'
  | 'quiet'

const THEME_SOUND: Record<string, Soundscape> = {
  memory: 'wind',
  desire: 'wind',
  signs: 'quiet',
  thin: 'wind',
  trade: 'market',
  eyes: 'quiet',
  names: 'quiet',
  dead: 'underground',
  sky: 'celestial',
  continuous: 'market',
  hidden: 'underground',
}

export function soundscapeForTheme(themeId: string): Soundscape {
  return THEME_SOUND[themeId] ?? 'quiet'
}

class AmbientSound {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private nodes: AudioNode[] = []
  private current: Soundscape = 'none'
  private enabled = false

  ensure(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  get isEnabled(): boolean {
    return this.enabled
  }

  enable(): void {
    this.enabled = true
    const ctx = this.ensure()
    if (ctx.state === 'suspended') void ctx.resume()
    if (this.master) {
      this.master.gain.cancelScheduledValues(ctx.currentTime)
      this.master.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 1.2)
    }
  }

  disable(): void {
    this.enabled = false
    if (!this.ctx || !this.master) return
    this.master.gain.cancelScheduledValues(this.ctx.currentTime)
    this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6)
  }

  private stopAll(): void {
    for (const n of this.nodes) {
      try {
        const src = n as OscillatorNode | AudioBufferSourceNode
        src.stop?.()
      } catch {
        /* already stopped */
      }
      n.disconnect()
    }
    this.nodes = []
  }

  private noiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
    const rate = ctx.sampleRate
    const buf = ctx.createBuffer(1, rate * seconds, rate)
    const data = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      // 轻度平滑，更像风声
      last = last * 0.97 + white * 0.03
      data[i] = last * 2.4
    }
    return buf
  }

  private brownNoise(ctx: AudioContext, seconds = 2): AudioBuffer {
    const rate = ctx.sampleRate
    const buf = ctx.createBuffer(1, rate * seconds, rate)
    const data = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.2
    }
    return buf
  }

  private playNoiseLoop(
    ctx: AudioContext,
    buffer: AudioBuffer,
    filterType: BiquadFilterType,
    freq: number,
    q: number,
    gain: number
  ): AudioBufferSourceNode {
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = filterType
    filter.frequency.value = freq
    filter.Q.value = q
    const g = ctx.createGain()
    g.gain.value = gain
    src.connect(filter)
    filter.connect(g)
    g.connect(this.master!)
    src.start()
    this.nodes.push(src)
    return src
  }

  setSoundscape(kind: Soundscape): void {
    if (kind === this.current) return
    this.current = kind
    if (!this.enabled) return
    const ctx = this.ensure()
    this.stopAll()
    if (kind === 'none' || kind === 'quiet') return

    if (kind === 'wind') {
      const buf = this.noiseBuffer(ctx, 3)
      this.playNoiseLoop(ctx, buf, 'bandpass', 380, 0.7, 0.55)
      this.playNoiseLoop(ctx, buf, 'lowpass', 180, 0.5, 0.35)
      // 慢调制
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.07
      const lg = ctx.createGain()
      lg.gain.value = 120
      lfo.connect(lg)
      lfo.start()
      this.nodes.push(lfo)
    } else if (kind === 'water') {
      const buf = this.brownNoise(ctx, 3)
      this.playNoiseLoop(ctx, buf, 'lowpass', 600, 0.8, 0.6)
      this.playNoiseLoop(ctx, buf, 'highpass', 900, 1.2, 0.18)
    } else if (kind === 'market') {
      const buf = this.brownNoise(ctx, 4)
      this.playNoiseLoop(ctx, buf, 'bandpass', 500, 0.9, 0.4)
      // 零星「人声」共振峰
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator()
        osc.type = 'triangle'
        osc.frequency.value = 140 + i * 55
        const g = ctx.createGain()
        g.gain.value = 0.028
        const f = ctx.createBiquadFilter()
        f.type = 'bandpass'
        f.frequency.value = 420 + i * 180
        f.Q.value = 4
        const lfo = ctx.createOscillator()
        lfo.frequency.value = 0.12 + i * 0.05
        const lg = ctx.createGain()
        lg.gain.value = 0.018
        lfo.connect(lg)
        lg.connect(g.gain)
        lfo.start()
        osc.connect(f)
        f.connect(g)
        g.connect(this.master!)
        osc.start()
        this.nodes.push(osc, lfo)
      }
    } else if (kind === 'celestial') {
      // 轻音簇
      const freqs = [220, 277, 330, 440, 554]
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = f
        const g = ctx.createGain()
        g.gain.value = 0.022 / (1 + i * 0.35)
        const lfo = ctx.createOscillator()
        lfo.frequency.value = 0.05 + i * 0.02
        const lg = ctx.createGain()
        lg.gain.value = 0.012
        lfo.connect(lg)
        lg.connect(g.gain)
        lfo.start()
        osc.connect(g)
        g.connect(this.master!)
        osc.start()
        this.nodes.push(osc, lfo)
      })
    } else if (kind === 'underground') {
      const buf = this.brownNoise(ctx, 4)
      this.playNoiseLoop(ctx, buf, 'lowpass', 140, 0.9, 0.7)
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = 48
      const g = ctx.createGain()
      g.gain.value = 0.06
      osc.connect(g)
      g.connect(this.master!)
      osc.start()
      this.nodes.push(osc)
    }
  }

  /** 点击反馈音 */
  click(pitch = 660): void {
    if (!this.enabled) return
    const ctx = this.ensure()
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = pitch
    g.gain.value = 0.0001
    g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18)
    osc.connect(g)
    g.connect(this.master!)
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  }

  /** 进入城市的氛围切换（短暂淡入） */
  enter(themeId: string): void {
    if (!this.enabled) return
    this.setSoundscape(soundscapeForTheme(themeId))
    this.click(880)
  }

  /** 返回地图 */
  toMap(): void {
    if (!this.enabled) return
    this.setSoundscape('wind')
    this.click(440)
  }
}

export const ambient = new AmbientSound()
