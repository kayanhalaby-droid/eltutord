'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Scene, { SceneName } from './Scenes';
import StudentCharacter, { CharacterName, CharacterExpression } from './StudentCharacters';

interface CharacterInScene {
  character: CharacterName;
  position: 'left' | 'center' | 'right';
  expression: CharacterExpression;
  message?: string;
  delay?: number;
}

export interface StorySceneProps {
  background: SceneName;
  characters: CharacterInScene[];
  width?: number;
  height?: number;
  onComplete?: () => void;
}

const POSITION_X: Record<'left' | 'center' | 'right', string> = {
  left:   '8%',
  center: '38%',
  right:  '65%',
};

export default function StoryScene({ background, characters, width = 400, height = 300, onComplete }: StorySceneProps) {
  const [visibleIdx, setVisibleIdx] = useState(0);

  useEffect(() => {
    if (visibleIdx >= characters.length) { onComplete?.(); return; }
    const char = characters[visibleIdx];
    const delay = char.delay ?? 500;
    const t = setTimeout(() => setVisibleIdx(i => i + 1), delay + (char.message ? 2500 : 800));
    return () => clearTimeout(t);
  }, [visibleIdx, characters, onComplete]);

  return (
    <div style={{ position: 'relative', width, height, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      {/* Background scene */}
      <Scene scene={background} width={width} height={height} />

      {/* Characters */}
      <AnimatePresence>
        {characters.slice(0, visibleIdx).map((char, i) => (
          <motion.div
            key={i}
            style={{ position: 'absolute', bottom: 20, left: POSITION_X[char.position], transformOrigin: 'bottom center' }}
            initial={{ x: char.position === 'left' ? -80 : char.position === 'right' ? 80 : 0, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
          >
            <StudentCharacter
              character={char.character}
              expression={char.expression}
              size={Math.round(height * 0.55)}
              message={char.message}
              flipped={char.position === 'right'}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
