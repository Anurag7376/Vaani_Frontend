import { useState, useRef, useCallback } from 'react';
import { speakText, stopSpeech } from '../utils/speech';

export { speakText, stopSpeech };

export default function VoiceButton({ onResult, disabled, className = '' }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onResult?.('', new Error('Speech recognition not supported'));
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error !== 'aborted') onResult?.('', e);
    };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult?.(transcript, null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const toggle = () => {
    if (disabled) return;
    if (listening) stopListening();
    else startListening();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-surface-dark disabled:opacity-50 ${
        listening
          ? 'bg-red-500 text-white animate-glow'
          : 'bg-primary-600 text-white hover:bg-primary-700'
      } ${className}`}
      aria-label={listening ? 'Stop listening' : 'Start voice input'}
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        {listening ? (
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        ) : (
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
        )}
      </svg>
    </button>
  );
}

