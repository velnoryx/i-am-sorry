'use client';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private synthInterval: ReturnType<typeof setInterval> | null = null;
  private chords = [
    [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
    [110.00, 130.81, 164.81, 220.00], // Am7 (A2, C3, E3, A3)
    [87.31, 130.81, 174.61, 218.63],  // Fmaj7 (F2, C3, F3, A3)
    [98.00, 146.83, 196.00, 246.94]   // G7 (G2, D3, G3, B3)
  ];
  private currentChordIndex = 0;
  private activeVoices: { osc: OscillatorNode; gain: GainNode }[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audio-muted');
      // Default to muted (true) to satisfy modern browser autoplay restrictions.
      this.isMuted = saved !== 'false';
    }
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as Record<string, typeof AudioContext>).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio-muted', String(this.isMuted));
    }
    if (this.isMuted) {
      this.stopAmbience();
    } else {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.startAmbience();
    }
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  public playHover() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle high sweep
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  public playClick() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  public playKeypress() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Very gentle clicky pop
    osc.frequency.setValueAtTime(380, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
  }

  public playPop() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Ascending pitch bubble pop sound
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  public startAmbience() {
    if (this.isMuted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (this.synthInterval) return;

    const playChord = () => {
      if (this.isMuted || !ctx) return;
      const chord = this.chords[this.currentChordIndex];
      this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;

      // Play notes in chord with slow attack and release
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const voiceGain = ctx.createGain();

        // Use sine for soft flute/rhodes like tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350 + Math.random() * 150, ctx.currentTime);
        filter.Q.setValueAtTime(0.7, ctx.currentTime);

        // Stagger entries
        const entryDelay = idx * 0.2 + Math.random() * 0.1;
        const startTime = ctx.currentTime + entryDelay;
        const attackTime = 2.0 + Math.random() * 0.5;
        const sustainTime = 2.5;
        const releaseTime = 3.0 + Math.random() * 0.8;

        voiceGain.gain.setValueAtTime(0.0, ctx.currentTime);
        voiceGain.gain.setValueAtTime(0.0, startTime);
        voiceGain.gain.linearRampToValueAtTime(0.015, startTime + attackTime);
        voiceGain.gain.setValueAtTime(0.015, startTime + attackTime + sustainTime);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + attackTime + sustainTime + releaseTime);

        osc.connect(filter);
        filter.connect(voiceGain);
        voiceGain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + attackTime + sustainTime + releaseTime + 0.1);

        this.activeVoices.push({ osc, gain: voiceGain });
      });

      // Clear voice array of ended voices occasionally
      if (this.activeVoices.length > 50) {
        this.activeVoices = this.activeVoices.slice(-20);
      }
    };

    // Play immediately and then repeat
    playChord();
    this.synthInterval = setInterval(playChord, 6000);
  }

  public stopAmbience() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.activeVoices.forEach((v) => {
      try {
        v.gain.gain.setValueAtTime(v.gain.gain.value, this.ctx?.currentTime || 0);
        v.gain.gain.exponentialRampToValueAtTime(0.0001, (this.ctx?.currentTime || 0) + 0.5);
        setTimeout(() => {
          try { v.osc.stop(); } catch { /* intentionally ignored */ }
        }, 600);
      } catch { /* intentionally ignored */ }
    });
    this.activeVoices = [];
  }
}

export const audio = new AudioEngine();
