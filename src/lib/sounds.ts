// Simple sound effects using Web Audio API
// No external assets required

const audioCtx = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

export function playSound(type: "correct" | "wrong") {
  if (!audioCtx) return;

  // Resume context if suspended (browsers require user interaction first)
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === "correct") {
    // Pleasant high-pitched "ding" sound
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  } else {
    // Low "buzz" sound for errors
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.linearRampToValueAtTime(100, now + 0.1);
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }
}

export function playFinishSound() {
  if (!audioCtx) return;

  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  // Success melody (C-E-G arpeggio)
  oscillator.type = "triangle";
  
  // Note 1: C5 (523.25 Hz)
  oscillator.frequency.setValueAtTime(523.25, now);
  gainNode.gain.setValueAtTime(0.15, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  oscillator.start(now);
  oscillator.stop(now + 0.6);

  // Note 2: E5 (659.25 Hz) - delayed
  const oscillator2 = audioCtx.createOscillator();
  const gainNode2 = audioCtx.createGain();
  oscillator2.connect(gainNode2);
  gainNode2.connect(audioCtx.destination);
  
  oscillator2.type = "triangle";
  oscillator2.frequency.setValueAtTime(659.25, now + 0.2);
  gainNode2.gain.setValueAtTime(0.15, now + 0.2);
  gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  oscillator2.start(now + 0.2);
  oscillator2.stop(now + 0.6);

  // Note 3: G5 (783.99 Hz) - delayed
  const oscillator3 = audioCtx.createOscillator();
  const gainNode3 = audioCtx.createGain();
  oscillator3.connect(gainNode3);
  gainNode3.connect(audioCtx.destination);
  
  oscillator3.type = "triangle";
  oscillator3.frequency.setValueAtTime(783.99, now + 0.4);
  gainNode3.gain.setValueAtTime(0.15, now + 0.4);
  gainNode3.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
  
  oscillator3.start(now + 0.4);
  oscillator3.stop(now + 0.6);
}

// Ensure audio context is ready on user interaction
export function initAudio() {
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}
