// FIX: This file's content has been implemented to resolve "is not a module" and other related errors.
export class AudioService {
  private outputContext: AudioContext;
  private outputGain: GainNode;
  private analyserNode: AnalyserNode;

  constructor() {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.outputContext = new AudioContext({ sampleRate: 24000 });
    this.outputGain = this.outputContext.createGain();
    this.analyserNode = this.outputContext.createAnalyser();
    this.outputGain.connect(this.analyserNode);
    this.analyserNode.connect(this.outputContext.destination);
  }

  public getOutputContext(): AudioContext {
    return this.outputContext;
  }

  public getAnalyserNode(): AnalyserNode {
    return this.analyserNode;
  }

  public playAudioBuffer(buffer: AudioBuffer, onEnd?: () => void): void {
    if (this.outputContext.state === 'suspended') {
      this.outputContext.resume();
    }
    const source = this.outputContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputGain);
    if (onEnd) {
      source.onended = onEnd;
    }
    source.start();
  }

  public setVolume(level: number): void {
    // Level is between 0.0 and 1.0
    this.outputGain.gain.setValueAtTime(level, this.outputContext.currentTime);
  }

  public duck(duration: number = 0.5): void {
    const now = this.outputContext.currentTime;
    this.outputGain.gain.cancelScheduledValues(now);
    this.outputGain.gain.linearRampToValueAtTime(0.2, now + duration);
  }

  public unduck(duration: number = 0.5): void {
    const now = this.outputContext.currentTime;
    this.outputGain.gain.cancelScheduledValues(now);
    this.outputGain.gain.linearRampToValueAtTime(1.0, now + duration);
  }
}
