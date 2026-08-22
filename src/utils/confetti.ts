import confetti from 'canvas-confetti';

export function fireWinConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#ec4899', '#8b5cf6', '#f43f5e', '#fbbf24', '#06b6d4', '#f472b6'],
    });
    // Right burst
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#ec4899', '#8b5cf6', '#f43f5e', '#fbbf24', '#06b6d4', '#f472b6'],
    });
  } catch {
    // fallback gracefully
  }
}

export function fireMatchConfetti() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#f43f5e', '#fda4af', '#f472b6', '#fb7185'],
    });
  } catch {
    // ignore
  }
}
