// Pronunciation Engine using Browser Web Speech Synthesis
// - Detects if a native or usable Tamil voice (ta-IN, ta, etc.) is available.
// - Cancels existing speech before starting new phrase.
// - If Tamil speech voice is unavailable, informs user clearly without pretending audio played.
// - Provides Romanized phonetic breakdowns as clear pronunciation guide.

class PronunciationService {
  constructor() {
    this.synth = typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis : null;
    this.tamilVoice = null;
    this.voicesLoaded = false;
    this.listeners = [];

    if (this.synth) {
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Look for Tamil voice (ta-IN, ta, ta_LK)
    this.tamilVoice = voices.find(v => v.lang.startsWith("ta") || v.lang.includes("Tamil") || v.name.includes("Tamil")) || null;
    this.voicesLoaded = true;
    this.notifyListeners();
  }

  onVoiceStatusChange(cb) {
    this.listeners.push(cb);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.hasTamilVoice()));
  }

  hasTamilVoice() {
    return Boolean(this.tamilVoice);
  }

  speakTamil(phraseTamil, onStart, onEnd, onError) {
    if (!this.synth) {
      if (onError) onError("Speech synthesis is not supported on this browser.");
      return false;
    }

    // Cancel any previous utterance
    this.synth.cancel();

    // Check voice support
    if (!this.tamilVoice) {
      // Refresh voices once in case they loaded lazily
      const voices = this.synth.getVoices();
      this.tamilVoice = voices.find(v => v.lang.startsWith("ta") || v.lang.includes("Tamil") || v.name.includes("Tamil")) || null;
    }

    if (!this.tamilVoice) {
      if (onError) {
        onError("No Tamil synthetic voice installed in your browser. Refer to the Romanized pronunciation guide below.");
      }
      return false;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(phraseTamil);
      utterance.voice = this.tamilVoice;
      utterance.lang = this.tamilVoice.lang || "ta-IN";
      utterance.rate = 0.85; // Slightly slower for clarity
      utterance.pitch = 1.0;

      if (onStart) utterance.onstart = onStart;
      if (onEnd) utterance.onend = onEnd;
      utterance.onerror = (e) => {
        console.warn("Speech synthesis utterance error:", e);
        if (onError) onError("Playback interrupted or voice error.");
      };

      this.synth.speak(utterance);
      return true;
    } catch (err) {
      if (onError) onError("Failed to initiate voice playback.");
      return false;
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechService = new PronunciationService();
