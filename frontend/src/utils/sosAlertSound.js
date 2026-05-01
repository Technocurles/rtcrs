let audioContext;
let activeAlert;
let alertSoundId = 0;

const getAudioContext = () => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
};

export const unlockSOSAlertSound = () => {
  const context = getAudioContext();
  if (!context) return;

  const gain = context.createGain();
  const oscillator = context.createOscillator();
  gain.gain.value = 0;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.01);
};

export const playSOSAlertSound = () => {
  const context = getAudioContext();
  if (!context) {
    console.log("Audio not supported");
    return;
  }

  if (activeAlert) {
    activeAlert.stop();
  }

  const soundId = ++alertSoundId;
  const startTime = context.currentTime;
  const duration = 10;
  const endTime = startTime + duration;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "square";
  oscillator.connect(gain);
  gain.connect(context.destination);

  gain.gain.setValueAtTime(0.0001, startTime);

  for (let time = startTime; time < endTime; time += 0.5) {
    oscillator.frequency.setValueAtTime(1250, time);
    oscillator.frequency.linearRampToValueAtTime(1650, Math.min(time + 0.22, endTime));
    oscillator.frequency.linearRampToValueAtTime(1250, Math.min(time + 0.45, endTime));

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.36, Math.min(time + 0.04, endTime));
    gain.gain.setValueAtTime(0.36, Math.min(time + 0.28, endTime));
    gain.gain.linearRampToValueAtTime(0.0001, Math.min(time + 0.38, endTime));
  }

  gain.gain.setValueAtTime(0.0001, endTime);
  oscillator.start(startTime);
  oscillator.stop(endTime);

  activeAlert = {
    id: soundId,
    stop: () => {
      try {
        oscillator.stop();
      } catch (error) {
        // The oscillator may already have stopped naturally.
      }
    },
  };

  oscillator.onended = () => {
    if (activeAlert?.id === soundId) {
      activeAlert = null;
    }
    oscillator.disconnect();
    gain.disconnect();
  };
};
