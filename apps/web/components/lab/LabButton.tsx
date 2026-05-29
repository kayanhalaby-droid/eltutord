'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LabPanel } from './LabPanel';

export function LabButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 z-50 bg-purple-600 text-white w-12 h-12 rounded-full shadow-xl shadow-purple-300 flex items-center justify-center text-xl"
        title="المختبر التجريبي"
        aria-label="فتح المختبر التجريبي"
      >
        🧪
      </motion.button>

      <AnimatePresence>
        {open && <LabPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
