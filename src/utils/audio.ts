// Clean Web Audio API tone generator and Web Speech API narrator
// 100% self-contained, zero external audio asset dependencies

class SoundEffectsManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Cash Register / Payment Success Chime
  playCashChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // High bright bell chord (E6, G#6, B6)
      const freqs = [1318.5, 1661.2, 1975.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.15, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.7);
      });
    } catch {
      // Audio autoplay blocked or unsupported
    }
  }

  // Digital Weighing Scale Beep
  playScaleBeep() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1760, now); // A6 beep

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // ignore
    }
  }

  // Auction Gavel Strike ("SOLD!")
  playGavelStrike() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      // Heavy wood impact thump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);

      // Wooden resonance click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(800, now);
      clickOsc.frequency.exponentialRampToValueAtTime(100, now + 0.06);

      clickGain.gain.setValueAtTime(0.25, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.09);
    } catch {
      // ignore
    }
  }

  // Auction Tension / Bid Tick
  playBidTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore
    }
  }

  // Notification Chime
  playNotificationSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [587.33, 880]; // D5, A5
      notes.forEach((note, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now + i * 0.1);

        gain.gain.setValueAtTime(0.18, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.45);
      });
    } catch {
      // ignore
    }
  }

  // Trash / Delete Sound (subtle swoosh down tone)
  playTrashSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // ignore
    }
  }

  // Thermal Parchi Printer / Receipt sound
  playParchiPrint() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const freqs = [1200, 1500, 1800];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        gain.gain.setValueAtTime(0.08, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.09);
      });
    } catch {
      // ignore
    }
  }
}

export const sounds = new SoundEffectsManager();

// Speech Synthesis Helper
export const isSpeechAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const stopSpeaking = () => {
  if (isSpeechAvailable()) {
    window.speechSynthesis.cancel();
  }
};

export const speakText = (text: string, lang: 'en' | 'te' | 'hi' = 'en') => {
  if (!isSpeechAvailable()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick voice if matched
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'te') {
      const teVoice = voices.find((v) => v.lang.includes('te') || v.lang.includes('TE'));
      if (teVoice) utterance.voice = teVoice;
      else utterance.lang = 'te-IN';
    } else if (lang === 'hi') {
      const hiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('HI'));
      if (hiVoice) utterance.voice = hiVoice;
      else utterance.lang = 'hi-IN';
    } else {
      const inVoice = voices.find((v) => v.lang === 'en-IN') || voices.find((v) => v.lang.startsWith('en'));
      if (inVoice) utterance.voice = inVoice;
      else utterance.lang = 'en-US';
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // speech not permitted or errored
  }
};

export const speakParchiDetails = (
  farmerName: string,
  flowerVariety: string,
  quantity: number,
  unit: string,
  rate: number,
  netPayable: number,
  lang: 'en' | 'te' | 'hi' = 'en'
) => {
  if (lang === 'te') {
    const text = `రైతు ${farmerName}. పువ్వు: ${flowerVariety}. పరిమాణం: ${quantity} ${unit}. ధర: కేజీకి ${rate} రూపాయలు. రైతుకి నికరంగా చెల్లించాల్సిన మొత్తం: ${netPayable} రూపాయలు.`;
    speakText(text, 'te');
  } else if (lang === 'hi') {
    const text = `किसान ${farmerName}. फूल: ${flowerVariety}. मात्रा: ${quantity} ${unit}. भाव: ${rate} रुपये प्रति इकाई. किसान को देय शुद्ध राशि: ${netPayable} रुपये.`;
    speakText(text, 'hi');
  } else {
    const text = `Mandi Sale Parchi. Farmer: ${farmerName}. Flower: ${flowerVariety}. Quantity: ${quantity} ${unit} at ${rate} rupees per unit. Net payable to farmer: ${netPayable} rupees.`;
    speakText(text, 'en');
  }
};

export const speakShipmentDetails = (
  farmerName: string,
  varietySummary: string,
  grossTotal: number,
  transportCharge: number,
  hamaliCharge: number,
  netPayable: number,
  lang: 'en' | 'te' | 'hi' = 'en'
) => {
  if (lang === 'te') {
    const text = `రైతు ${farmerName} ఒకే ట్రక్కు కన్సైన్‌మెంట్. రకాలు: ${varietySummary}. మొత్తం అమ్మకం: ${grossTotal} రూపాయలు. రవాణా ఖర్చు: ${transportCharge} రూపాయలు. హమాలీ ఖర్చు: ${hamaliCharge} రూపాయలు. నికర మొత్తం: ${netPayable} రూపాయలు.`;
    speakText(text, 'te');
  } else if (lang === 'hi') {
    const text = `किसान ${farmerName} की एक गाड़ी खेप. किस्में: ${varietySummary}. कुल बिक्री: ${grossTotal} रुपये. भाड़ा: ${transportCharge} रुपये. हमाली: ${hamaliCharge} रुपये. किसान को शुद्ध भुगतान: ${netPayable} रुपये.`;
    speakText(text, 'hi');
  } else {
    const text = `Consignment for farmer ${farmerName}. Varieties: ${varietySummary}. Total Gross: ${grossTotal} rupees. Transport: ${transportCharge} rupees. Hamali: ${hamaliCharge} rupees. Net payable to farmer: ${netPayable} rupees.`;
    speakText(text, 'en');
  }
};
