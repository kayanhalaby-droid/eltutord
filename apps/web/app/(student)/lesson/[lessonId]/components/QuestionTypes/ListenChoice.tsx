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
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

interface Option { id: string; text: string }
interface Props {
  content: { questionText: string; audioText: string; options: Option[] };
  onAnswer: (selectedIds: string[]) => void;
  disabled?: boolean;
  correctIds?: string[];
  selectedIds?: string[];
}

export default function ListenChoice({ content, onAnswer, disabled, correctIds, selectedIds: ext }: Props) {
  const { token } = useAuthStore();
  const [selected, setSelected] = useState<string[]>(ext ?? []);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [played, setPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(async () => {
    if (loading) return;
    if (audioSrc) { audioRef.current?.play(); setPlayed(true); return; }
    setLoading(true);
    try {
      const data = await apiFetch<{ audio: string | null; text: string }>(
        '/tts',
        { method: 'POST', body: JSON.stringify({ text: content.audioText }), token: token! },
      );
      if (data?.audio) {
        setAudioSrc(data.audio);
        const a = new Audio(data.audio);
        audioRef.current = a;
        a.play();
      } else {
        // Fallback: browser Web Speech API in Arabic
        speakArabic(content.audioText);
      }
    } catch {
      speakArabic(content.audioText);
    } finally {
      setPlayed(true);
      setLoading(false);
    }
  }, [audioSrc, content.audioText, loading, token]);

  // Auto-play when question appears
  useEffect(() => {
    const t = setTimeout(() => playAudio(), 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.audioText]);

  const choose = (id: string) => {
    if (disabled || !played) return;
    setSelected([id]);
    onAnswer([id]);
  };

  const optStyle = (id: string) => {
    if (!disabled) return selected.includes(id) ? 'border-brand bg-brand/10 text-brand font-bold' : 'border-gray-200 bg-white hover:border-brand/50';
    if (correctIds?.includes(id)) return 'border-green-500 bg-green-50 text-green-700 font-bold';
    if (selected.includes(id) && !correctIds?.includes(id)) return 'border-red-400 bg-red-50 text-red-700';
    return 'border-gray-200 bg-gray-50 opacity-50';
  };

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <p className="text-xl font-bold text-brand text-center">{content.questionText}</p>

      {/* Play button */}
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
        <p className="text-center text-sm text-muted-foreground">اضغط للاستماع أولاً ثم اختر الإجابة</p>
      )}

      <div className={`flex flex-col gap-3 transition-opacity ${played ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        {content.options.map((opt, i) => (
          <motion.button
            key={opt.id}
            className={`w-full px-5 py-3 rounded-xl border-2 text-right transition-all font-semibold ${optStyle(opt.id)}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            onClick={() => choose(opt.id)}
            disabled={disabled || !played}
          >
            {opt.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
