import confetti from 'canvas-confetti';

let customCanvas: HTMLCanvasElement | null = null;
let confettiInstance: confetti.CreateTypes | null = null;

function getConfettiInstance() {
  if (typeof window === 'undefined') return null;

  try {
    if (!customCanvas) {
      customCanvas = document.createElement('canvas');
      customCanvas.style.position = 'fixed';
      customCanvas.style.top = '0';
      customCanvas.style.left = '0';
      customCanvas.style.width = '100vw';
      customCanvas.style.height = '100vh';
      customCanvas.style.pointerEvents = 'none';
      customCanvas.style.zIndex = '99999';
      document.body.appendChild(customCanvas);

      confettiInstance = confetti.create(customCanvas, {
        resize: true,
        useWorker: false,
      });
    }
    return confettiInstance;
  } catch (err) {
    console.warn('Unable to initialize canvas confetti:', err);
    return null;
  }
}

/**
 * Trigger celebration fireworks for King winner
 */
export const triggerKingCelebration = (elementId?: string) => {
  try {
    const fireInstance = getConfettiInstance();
    if (!fireInstance) return;

    const count = 160;
    const colors = ['#f59e0b', '#fbbf24', '#38bdf8', '#a855f7', '#ec4899', '#ffffff'];

    const fire = (particleRatio: number, opts: confetti.Options) => {
      try {
        fireInstance({
          origin: { y: 0.7 },
          ...opts,
          particleCount: Math.floor(count * particleRatio),
          disableForReducedMotion: true,
        });
      } catch (e) {
        console.warn('Confetti burst caught safely:', e);
      }
    };

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors,
    });
    fire(0.2, {
      spread: 60,
      colors,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors,
    });
  } catch (err) {
    console.warn('King celebration confetti error prevented:', err);
  }
};

/**
 * Trigger small celebratory vote pulse
 */
export const triggerVotePulse = () => {
  try {
    const fireInstance = getConfettiInstance();
    if (!fireInstance) return;

    fireInstance({
      particleCount: 20,
      spread: 45,
      origin: { y: 0.85 },
      colors: ['#60a5fa', '#c084fc', '#38bdf8', '#fbbf24'],
      disableForReducedMotion: true,
    });
  } catch (err) {
    console.warn('Vote pulse confetti error caught safely:', err);
  }
};
