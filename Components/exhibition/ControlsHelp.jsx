import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "./Button";
import { HelpCircle, X, Eye, EyeOff } from 'lucide-react';

export default function ControlsHelp({ onToggleWalls, wallsVisible }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton d'aide */}
      <div className="fixed top-6 right-6 z-30 flex gap-2">
        {/* Toggle murs */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 border border-white/10"
          onClick={onToggleWalls}
          title={wallsVisible ? "Masquer les murs" : "Afficher les murs"}
        >
          {wallsVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </Button>

        {/* Aide */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 border border-white/10"
          onClick={() => setIsOpen(true)}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>

      {/* Panel d'aide */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-white/10 rounded-lg p-8 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-light text-white">Contrôles</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4 text-white/80">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-sm">Z</kbd>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-sm">Q</kbd>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-sm">S</kbd>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-sm">D</kbd>
                  </div>
                  <span className="text-sm">Se déplacer</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 flex justify-center">
                    <kbd className="px-3 py-1 bg-white/10 rounded text-sm">Souris</kbd>
                  </div>
                  <span className="text-sm">Regarder autour</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 flex justify-center">
                    <kbd className="px-3 py-1 bg-white/10 rounded text-sm">Clic</kbd>
                  </div>
                  <span className="text-sm">Interagir / Verrouiller souris</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 flex justify-center">
                    <kbd className="px-3 py-1 bg-white/10 rounded text-sm">Échap</kbd>
                  </div>
                  <span className="text-sm">Libérer la souris</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 flex justify-center">
                    <kbd className="px-3 py-1 bg-white/10 rounded text-sm">Shift</kbd>
                  </div>
                  <span className="text-sm">Courir</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-white/50">
                  Cliquez sur les œuvres pour voir leurs détails. 
                  Passez les portes pour changer de salle.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}