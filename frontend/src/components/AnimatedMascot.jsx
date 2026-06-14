import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AnimatedMascot.css';

const GREETING_LINES = [
  "Hi! I'm Nova 🌻",
  "I'm here for you, always.",
  "What's on your mind today?",
];

function useTypewriter(text, speed = 45, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function AnimatedMascot() {
  const [lineIndex, setLineIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);

  const currentLine = GREETING_LINES[lineIndex];
  const { displayed, done } = useTypewriter(currentLine, 48, lineIndex === 0 ? 800 : 300);

  // Cycle to next greeting line after each one finishes
  useEffect(() => {
    if (done && lineIndex < GREETING_LINES.length - 1) {
      const t = setTimeout(() => setLineIndex((prev) => prev + 1), 1800);
      return () => clearTimeout(t);
    }
  }, [done, lineIndex]);

  return (
    <div className="animated-mascot-wrapper">
      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            className="mascot-speech-bubble"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.4 }}
          >
            <span>{displayed}</span>
            {!done && <span className="cursor-blink">|</span>}
            <div className="bubble-tail" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot image with entrance + continuous float */}
      <motion.div
        className="mascot-float-container"
        initial={{ opacity: 0, y: 40, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, duration: 0.8 }}
      >
        {/* Waving hand overlay */}
        <div className="wave-hand">👋</div>

        {/* The mascot image — floats gently */}
        <motion.img
          src="/mascot-transparent.png"
          alt="Nova mascot"
          className="mascot-anim-img"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </div>
  );
}
