'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';

function speakArabic(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = 0.75;
  window.speechSynthesis.speak(u);
}

interface Props {
  content: { questionText: string; audioText: string; hint?: string };
  onAnswer: (text: string) => void;
  disabled?: boolean;
  isCorrect?: boolean;
}

export default function ListenWrite({ content, onAnswer, disabled, isCorrect }: Props) {
  const { token } = useAuthStore();
  const [text, setText] = useState('');
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [played, setPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(async () => {
    if (loading) return;
    if (audioSrc) { audioRef.current?.play(); setPlayed(true); return; }
    setLoading(true);
    try {
      const data = await apiFetch<{ audio: string | null }>(
        '/tts',
        { method: 'POST', body: JSON.stringify({ text: content.audioText }), token: token! },
      );
      if (data?.audio) {
        setAudioSrc(data.audio);
        const a = new Audio(data.audio);
        audioRef.current = a;
        a.play();
      } else {
        speakArabic(content.audioText);
      }
    } catch {
      speakArabic(content.audioText);
    } finally {
      setPlayed(true);
      setLoading(false);
    }
  }, [audioSrc, content.audioText, loading, token]);

  // Auto-play on question mount
  useEffect(() => {
    const t = setTimeout(() => playAudio(), 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.audioText]);

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <p className="text-xl font-bold text-brand text-center">{content.questionText}</p>

      <div className="flex justify-center">
        <motion.button
          className="flex items-center gap-3 px-8 py-4 bg-brand text-white rounded-2xl font-bold text-lg shadow-md hover:brightness-110 active:scale-95 transition-all"
          whileTap={{ scale: 0.96 }}
          onClick={playAudio}
          disabled={loading}
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : <Volume2 size={24} />}
          {played ? 'استمع مجدداً' : 'استمع للكلمة'}
        </motion.button>
      </div>

      {!played && (
        <p className="text-center text-sm text-muted-foreground">استمع ثم اكتب ما سمعت</p>
      )}

      <div className={`flex flex-col gap-3 transition-opacity ${played ? 'opacity-100' : 'opacity-40'}`}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && text.trim()) onAnswer(text.trim()); }}
          disabled={disabled || !played}
          placeholder="اكتب ما سمعت..."
          dir="rtl"
          className={`w-full px-5 py-3 rounded-xl border-2 text-left text-lg font-semibold outline-none transition-all
            ${disabled
              ? isCorrect ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'
              : 'border-brand/40 bg-white focus:border-brand'}`}
        />
        {!disabled && played && (
          <button
            className="self-end px-6 py-2 bg-brand text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40"
            onClick={() => text.trim() && onAnswer(text.trim())}
            disabled={!text.trim()}
          >
            تأكيد
          </button>
        )}
        {disabled && content.hint && (
          <p className="text-sm text-muted-foreground text-center">الكلمة: {content.hint}</p>
        )}
      </div>
    </div>
  );
}
