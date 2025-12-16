import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "./Button";
import { Play } from 'lucide-react';
import { EXHIBITION_CONFIG } from './ExhibitionData';

export default function IntroOverlay({ isVisible, onStart }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          {/* Fond animé subtil */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 60,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-5"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #4a0080 0%, transparent 50%), radial-gradient(circle at 70% 70%, #8b0000 0%, transparent 50%)'
              }}
            />
          </div>

          <div className="relative z-10 max-w-2xl mx-6 text-center">
            {/* Titre avec effet de déséquilibre */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <motion.h1 
                className="text-6xl md:text-8xl font-extralight tracking-[0.3em] text-white mb-4"
                animate={{ rotate: [-0.5, 0.5, -0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {EXHIBITION_CONFIG.title}
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-white mb-8 tracking-widest uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {EXHIBITION_CONFIG.subtitle}
              </motion.p>
            </motion.div>

            {/* Lignes décoratives */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="w-32 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"
            />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-white text-base md:text-lg leading-relaxed mb-12 whitespace-pre-line"
            >
              {EXHIBITION_CONFIG.introText}
            </motion.p>

            {/* Bouton Commencer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Button
                onClick={onStart}
                className="group relative px-10 py-6 bg-transparent border border-white/30 hover:border-white/60 text-white rounded-none transition-all duration-500 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/5 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative flex items-center gap-3 text-lg tracking-wider">
                  <Play className="h-5 w-5" />
                  ENTRER
                </span>
              </Button>
            </motion.div>

            {/* Indication de contrôles */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 text-xs text-white/70 tracking-wider"
            >
              Meilleure expérience sur ordinateur avec casque audio
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
