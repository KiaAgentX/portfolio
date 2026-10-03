/**
 * Procedural sound effects via WebAudio (roadmap 2.4).
 * Zero downloads — spec §103 forbids fake/placeholder assets; these are
 * synthesized. Swap points for real CC0 audio are marked per effect.
 */
export type SfxName = 'splash' | 'catch' | 'escape' | 'line_break' | 'danger' | 'depth_zone' | 'record';

export class Sfx {
  private ctx: AudioContext | null = null;
  private muted = false;

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  /** Must be called from a user gesture (browser autoplay policy). */
  resume(): void {
    if (!this.ctx) {
      type WinAudio = typeof window & { webkitAudioContext?: typeof AudioContext };
      const Ctx = window.AudioContext ?? (window as WinAudio).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  play(name: SfxName): void {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case 'splash':
        this.noise(t, 0.35, 900, 0.25);
        break;
      case 'catch': // SWAP: real CC0 catch chime
        this.blip(t, 660, 0.12, 'sine', 0.22);
        this.blip(t + 0.09, 880, 0.16, 'sine', 0.2);
        break;
      case 'escape':
        this.blip(t, 320, 0.18, 'triangle', 0.18, 140);
        break;
      case 'line_break': // SWAP: real CC0 snap
        this.noise(t, 0.12, 2400, 0.3);
        this.blip(t + 0.02, 180, 0.2, 'sawtooth', 0.22, 60);
        break;
      case 'danger':
        this.blip(t, 110, 0.4, 'sawtooth', 0.25, 70);
        break;
      case 'depth_zone':
        this.blip(t, 440, 0.25, 'sine', 0.12, 330);
        break;
      case 'record':
        this.blip(t, 523, 0.12, 'sine', 0.2);
        this.blip(t + 0.1, 659, 0.12, 'sine', 0.2);
        this.blip(t + 0.2, 784, 0.22, 'sine', 0.22);
        break;
    }
  }

  private blip(at: number, freq: number, dur: number, type: OscillatorType, gain: number, glideTo?: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, glideTo), at + dur);
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(at);
    osc.stop(at + dur + 0.02);
  }

  private noise(at: number, dur: number, cutoff: number, gain: number): void {
    const ctx = this.ctx!;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + dur);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start(at);
  }
}
