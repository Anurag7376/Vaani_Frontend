/**
 * Cleans text for natural speech synthesis.
 * Removes markdown, URLs, and normalizes whitespace so the voice sounds professional.
 */
export function cleanTextForSpeech(text) {
  if (text == null || typeof text !== 'string') return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/•/g, '')
    .replace(/[-–—]\s/g, ' ')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detects the likely language of input text based on character patterns
 * @param {string} text - The text to analyze
 * @returns {string} - Detected language code (en, hi, ta, te, mr, bn, etc.)
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';

  // Count characters from different scripts
  const hindiChars = (text.match(/[ँ-ॿ]/g) || []).length;
  const tamilChars = (text.match(/[அ-ஹ\u0B80-\u0BFF]/g) || []).length;
  const teluguChars = (text.match(/[అ-హ\u0C00-\u0C7F]/g) || []).length;
  const marathiChars = (text.match(/[ऄ-ॣ।-ॿ]/g) || []).length; // Marathi shares Devanagari script with Hindi
  const bengaliChars = (text.match(/[অ-ঌএ-ঐও-নপ-রলশ-হৎড়ঢ়য়০-৺]/g) || []).length;
  const gujaratiChars = (text.match(/[અ-હ\u0A80-\u0AFF]/g) || []).length;
  const punjabiChars = (text.match(/[ਅ-ਊਏ-ਐਓ-ਨਪ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹਖ਼-ੜਫ਼ਬ-ਭਣ-ਮਞ-ਰਲ-ਲ਼ਵ-ਸ਼ਸ-ਹਖ਼-ੜਫ਼]/g) || []).length;
  const malayalamChars = (text.match(/[അ-ഹ\u0D00-\u0D7F]/g) || []).length;
  const kannadaChars = (text.match(/[ಅ-ಹ\u0C80-\u0CFF]/g) || []).length;

  const totalNonEnglish = hindiChars + tamilChars + teluguChars + marathiChars + 
                          bengaliChars + gujaratiChars + punjabiChars + malayalamChars + kannadaChars;
  
  // If most characters are non-English, detect the dominant script
  if (totalNonEnglish > (text.replace(/[^\w\s]/g, '').length * 0.3)) { // 30% threshold
    const langCounts = {
      hi: hindiChars,
      ta: tamilChars,
      te: teluguChars,
      mr: marathiChars,
      bn: bengaliChars,
      gu: gujaratiChars,
      pa: punjabiChars,
      ml: malayalamChars,
      kn: kannadaChars
    };
    
    const detectedLang = Object.entries(langCounts)
      .sort(([,a], [,b]) => b - a)[0];
      
    if (detectedLang[1] > 0) {
      return detectedLang[0];
    }
  }
  
  // Default to English if no other language detected
  return 'en';
}

/**
 * Stops any ongoing speech synthesis. Safe to call when nothing is playing.
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Returns a promise that resolves when speech voices are available.
 * Chrome and some browsers load voices asynchronously (getVoices() is empty until voiceschanged).
 */
function getVoicesWhenReady() {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const onVoicesChanged = () => {
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(synth.getVoices());
    };
    synth.addEventListener('voiceschanged', onVoicesChanged);
  });
}

/**
 * Speaks text using the Web Speech API with a natural, professional tone.
 * - Cleans markdown and URLs before speaking
 * - Prefers Indian English voice when available
 * - Slightly slower rate for clarity
 * - Cancels any previous speech to prevent overlap
 * @param {string} text - Raw text (may contain markdown/URLs)
 * @param {() => void} [onEnd] - Called when speech ends or errors
 * @returns {() => void} Cancel function to stop this speech
 */
export function speakText(text, onEnd) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return stopSpeech;
  }

  const raw = text != null && typeof text === 'string' ? text : String(text || '');
  const cleaned = cleanTextForSpeech(raw);
  if (!cleaned) {
    onEnd?.();
    return stopSpeech;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  // Set language based on content
  const detectedLang = detectLanguage(cleaned);
  utterance.lang = detectedLang === 'en' ? 'en-IN' : detectedLang;
  
  utterance.onend = onEnd;
  utterance.onerror = onEnd;

  // Try to set the voice immediately, with fallback to getVoicesWhenReady
  const voices = window.speechSynthesis.getVoices();
  let preferredVoice = 
    voices.find((v) => v.lang.startsWith(detectedLang)) ||
    voices.find((v) => v.lang === 'en-IN') ||
    voices.find((v) => v.lang.startsWith('en-IN')) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.startsWith('en-'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  } else {
    // Fallback to wait for voices to load
    getVoicesWhenReady().then((loadedVoices) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const fallbackVoice = 
        loadedVoices.find((v) => v.lang.startsWith(detectedLang)) ||
        loadedVoices.find((v) => v.lang === 'en-IN') ||
        loadedVoices.find((v) => v.lang.startsWith('en-IN')) ||
        loadedVoices.find((v) => v.lang === 'en-US') ||
        loadedVoices.find((v) => v.lang.startsWith('en-')) ||
        loadedVoices[0]; // Fallback to first available voice
      
      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
      }
      window.speechSynthesis.speak(utterance);
    }).catch(() => {
      // If voice loading fails, speak with default voice
      window.speechSynthesis.speak(utterance);
    });
  }

  return stopSpeech;
}