import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ChatBubble from '../components/ChatBubble';
import VoiceButton, { speakText, stopSpeech } from '../components/VoiceButton';
import { chatApi } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';
import { detectLanguage } from '../utils/speech';

const WELCOME = "Hello! I'm Vaani. I can help you discover government schemes you may be eligible for. You can type or use the microphone. How can I help you today?";

export default function Chat() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([{ role: 'ai', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakResponses, setSpeakResponses] = useState(true);
  const messagesEndRef = useRef(null);
  const cancelSpeakRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    // Detect language of the input
    const inputLanguage = detectLanguage(trimmed);

    setInput('');
    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setLoading(true);
    stopSpeech();
    cancelSpeakRef.current = null;

    try {
      const { data } = await chatApi.send(trimmed, inputLanguage);
      const rawReply = data?.reply ?? data?.response ?? 'No response.';
      const replyText =
        typeof rawReply === 'string'
          ? rawReply
          : (rawReply?.text ?? rawReply?.message ?? rawReply?.content ?? (rawReply ? String(rawReply) : null)) ?? 'No response.';
      setMessages((m) => [...m, { role: 'ai', text: replyText }]);
      if (speakResponses && replyText) {
        cancelSpeakRef.current = speakText(replyText);
      }
    } catch (err) {
      const msg =
        err.response?.status === 401
          ? 'Please log in to chat.'
          : err.response?.data?.detail || err.message || 'Something went wrong.';
      toast.error(typeof msg === 'string' ? msg : 'Request failed');
      setMessages((m) => [
        ...m,
        { role: 'ai', text: "Sorry, I couldn't process that. Please try again or check your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (transcript, error) => {
    if (error) {
      toast.error('Voice input failed. Try again.');
      return;
    }
    if (transcript?.trim()) sendMessage(transcript.trim());
  };

  return (
    <PageTransition className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {!isAuthenticated() && (
        <p className="px-4 py-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          You're not logged in. The chatbot may ask for your details to recommend schemes.
        </p>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatBubble message={msg.text} isUser={msg.role === 'user'} />
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ChatBubble message="" isUser={false} isTyping />
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark">
        <div className="flex flex-col-reverse sm:flex-row sm:items-end gap-2 sm:gap-3">
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px] max-h-32 transition-shadow duration-200"
            />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={speakResponses}
                  onChange={(e) => setSpeakResponses(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                Read responses aloud
              </label>
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  cancelSpeakRef.current = null;
                }}
                className="font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Stop voice"
              >
                Stop voice
              </button>
            </div>
          </div>
          <div className="flex gap-2 justify-end sm:justify-normal">
            <VoiceButton onResult={handleVoiceResult} disabled={loading} />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-3 rounded-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white transition-colors duration-200 hover:shadow-md"
              aria-label="Send"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
