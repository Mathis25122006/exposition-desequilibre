import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "./Button";
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function RoomCartel({ room, isVisible, onDismiss }) {
  const [page, setPage] = useState(0);

  if (!room) return null;

  const pages = room.description.split('\n\n'); // découpe le texte en parties
  const currentText = pages[page] || '';

  const getRoomIcon = () => {
    switch (room.id) {
      case 'room1': return '✦'; // Cosmos
      case 'room2': return '◉'; // Corps
      case 'room3': return '◈'; // Esprit
      default: return '◇';
    }
  };

  const nextPage = () => {
    if (page < pages.length - 1) setPage(page + 1);
    else onDismiss(); // dernière page → fermer
  };

  const prevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative max-w-2xl mx-6"
          >
            {/* Cadres décoratifs */}
            <div 
              className="absolute inset-0 border-2 rounded-sm transform -rotate-1"
              style={{ borderColor: room.accentColor + '40' }}
            />
            <div 
              className="absolute inset-0 border-2 rounded-sm transform rotate-1"
              style={{ borderColor: room.accentColor + '40' }}
            />

            <div 
              className="relative bg-black p-10 md:p-14 rounded-sm"
              style={{ 
                boxShadow: `0 0 60px ${room.accentColor}70, inset 0 0 30px ${room.accentColor}30`
              }}
            >
              {/* Icône */}
              <div 
                className="text-4xl mb-6 opacity-100"
                style={{ color: room.accentColor }}
              >
                {getRoomIcon()}
              </div>

              {/* Titre */}
              <h2 
                className="text-4xl md:text-5xl font-extralight tracking-wider mb-6"
                style={{ color: room.id === 'room3' ? '#1a1a2e' : '#ffffff' }}
              >
                {room.name}
              </h2>

              <div 
                className="w-20 h-px mb-8"
                style={{ backgroundColor: room.accentColor }}
              />

              {/* Texte de la page */}
              <p 
                className="text-lg leading-relaxed font-light whitespace-pre-line"
                style={{ color: room.id === 'room3' ? '#2a2a3e' : '#e0e0e0' }}
              >
                {currentText}
              </p>

              {/* Sous-thèmes */}
              {room.subthemes && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {room.subthemes.map((subtheme, index) => (
                    <span
                      key={index}
                      className="px-4 py-1.5 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: subtheme.color + '50',
                        color: subtheme.color,
                        border: `1px solid ${subtheme.color}70`
                      }}
                    >
                      {subtheme.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-10 flex justify-between items-center">
                {/* Précédent seulement si page > 0 */}
                {page > 0 ? (
                  <Button
                    onClick={prevPage}
                    className="group px-6 py-3 bg-white/25 hover:bg-white/40 text-white border border-white/40 rounded-sm transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span>Précédent</span>
                  </Button>
                ) : <div />} {/* espace vide pour alignement */}

                <div className="flex gap-4">
                  {/* Bouton passer toujours visible */}
                  <Button
                    onClick={onDismiss}
                    className="group px-6 py-3 bg-white/25 hover:bg-white/40 text-white border border-white/40 rounded-sm transition-all duration-300"
                  >
                    <span>Passer</span>
                  </Button>

                  {/* Bouton suivant */}
                  <Button
                    onClick={nextPage}
                    className="group px-6 py-3 bg-white/25 hover:bg-white/40 text-white border border-white/40 rounded-sm transition-all duration-300"
                  >
                    <span>{page < pages.length - 1 ? 'Suivant' : 'Terminer'}</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
