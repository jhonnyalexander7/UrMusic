import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioEffectsService {

  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private convolver: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  // Conecta un elemento <audio> a la cadena de efectos
  connectAudio(audioElement: HTMLAudioElement) {
    // Si ya había un audio conectado, desconectar primero
    if (this.currentAudio === audioElement && this.audioContext) {
      return; // ya está conectado
    }

    this.audioContext = new AudioContext();
    this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
    this.currentAudio = audioElement;

    // Filtro de graves (Bajo) - low shelf
    this.bassFilter = this.audioContext.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 200;
    this.bassFilter.gain.value = 0;

    // Filtro de agudos (Agudos) - high shelf
    this.trebleFilter = this.audioContext.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 3000;
    this.trebleFilter.gain.value = 0;

    // Reverb simple usando ConvolverNode con impulso generado
    this.convolver = this.audioContext.createConvolver();
    this.convolver.buffer = this.createReverbImpulse(2, 2);

    this.dryGain = this.audioContext.createGain();
    this.wetGain = this.audioContext.createGain();
    this.dryGain.gain.value = 1;
    this.wetGain.gain.value = 0;

    // Cadena: source -> bass -> treble -> [dry/wet reverb] -> destination
    this.sourceNode.connect(this.bassFilter);
    this.bassFilter.connect(this.trebleFilter);

    this.trebleFilter.connect(this.dryGain);
    this.trebleFilter.connect(this.convolver);
    this.convolver.connect(this.wetGain);

    this.dryGain.connect(this.audioContext.destination);
    this.wetGain.connect(this.audioContext.destination);
  }

  // Genera un impulso de reverb sintético
  private createReverbImpulse(duration: number, decay: number): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.audioContext!.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  // Ajusta el nivel de bajo (0-100)
  setBass(value: number) {
    if (this.bassFilter) {
      // Mapear 0-100 a -15dB a +15dB
      this.bassFilter.gain.value = ((value - 50) / 50) * 15;
    }
  }

  // Ajusta el nivel de agudos (0-100)
  setTreble(value: number) {
    if (this.trebleFilter) {
      this.trebleFilter.gain.value = ((value - 50) / 50) * 15;
    }
  }

  // Ajusta el nivel de reverb (0-100)
  setReverb(value: number) {
    if (this.wetGain && this.dryGain) {
      const wetAmount = value / 100;
      this.wetGain.gain.value = wetAmount * 0.6;
      this.dryGain.gain.value = 1 - (wetAmount * 0.3);
    }
  }

  // Reanuda el contexto de audio (necesario por políticas del navegador)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  disconnect() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.sourceNode = null;
      this.currentAudio = null;
    }
  }
}