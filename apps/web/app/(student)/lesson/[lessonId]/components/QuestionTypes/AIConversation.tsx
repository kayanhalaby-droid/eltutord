'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot } from 'lucide-react';
import NoorOwl from '@/components/NoorOwl';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';

interface Message { role: 'user' | 'assistant'; content: string }
interface Props {
  content: {
    questionText: string;
    systemPrompt: string;
    startMessage: string;
    maxTurns?: number;
    vocab?: string;
  };
  onAnswer: (result: { completed: boolean }) => void;
  disabled?: boolean;
}

export default function AIConversation({ content, onAnswer, disabled }: Props) {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: content.startMessage },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const maxTurns = content.maxTurns ?? 4;
  const userTurns = messages.filter(m => m.role === 'user').length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading || done) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);

    if (userTurns + 1 >= maxTurns) {
      const finalMsg: Message = { role: 'assistant', content: 'شكراً على المحادثة الجميلة! استمر في التدريب يومياً. 🌟' };
      setMessages([...next, finalMsg]);
      setDone(true);
      onAnswer({ completed: true });
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<{ reply: string }>(
        '/ai/chat',
        {
          method: 'POST',
          body: JSON.stringify({
            messages: next.map(m => ({ role: m.role, content: m.content })),
            systemPrompt: content.systemPrompt,
          }),
          token: token!,
        },
      );
      const reply = data?.reply ?? 'أحسنت! استمر!';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'أحسنت! استمر في التدريب.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <p className="text-xl font-bold text-brand text-center">{content.questionText}</p>
      {content.vocab && (
        <p className="text-sm text-center text-muted-foreground">الكلمة: <span className="font-bold text-brand">{content.vocab}</span></p>
      )}

      {/* Chat area */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 max-h-64 overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {msg.role === 'assistant' && (
                <NoorOwl expression="happy" size={32} />
              )}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-brand text-white rounded-tr-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-2 items-center">
            <NoorOwl expression="studying" size={28} />
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-brand rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Progress */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>{userTurns}/{maxTurns} ردود</span>
        {done && <span className="text-green-600 font-bold">✓ اكتملت المحادثة</span>}
      </div>

      {/* Input */}
      {!disabled && !done && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="اكتب ردك هنا..."
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-brand/30 focus:border-brand outline-none text-sm"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-brand text-white rounded-xl disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      )}

      {!disabled && done && (
        <button
          onClick={() => onAnswer({ completed: true })}
          className="self-center px-8 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:opacity-90"
        >
          التالي →
        </button>
      )}
    </div>
  );
}
