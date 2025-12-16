import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Importez vos composants Button
import { Button } from "./Button"; 
// Import des icônes de Lucide pour les métadonnées et types
import { 
  X, 
  Image as ImageIcon, 
  Box, 
  Film, 
  Calendar, 
  Ruler, 
  Palette, 
  ArrowRight, 
  Home,        // Nouvelle icône pour Lieu de conservation
  Hash         // Nouvelle icône pour Numéro d'inventaire
} from 'lucide-react'; 

export default function ArtworkPanel({ artwork, isVisible, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Réinitialiser la slide au changement d'œuvre
  useEffect(() => {
    if (isVisible) {
      setCurrentSlide(0);
    }
  }, [isVisible, artwork]);

  if (!artwork) return null;

  // Prépare la description pour la pagination
  const slides = artwork.descriptionSlides || (artwork.description ? [artwork.description] : []);

  const goNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Dernière slide, on ferme
      onClose();
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const skipAll = () => {
    onClose();
  };

  // Logique pour déterminer le type et l'icône
  let typeText = 'Œuvre';
  let TypeIcon = Box; 

  if (artwork.type === 'painting') {
    typeText = 'Peinture';
    TypeIcon = ImageIcon;
  } else if (artwork.type === 'glb') {
    typeText = 'Sculpture 3D';
    TypeIcon = Box;
  } else if (artwork.type === 'youtube') {
    typeText = 'Vidéo';
    TypeIcon = Film; 
  } else if (artwork.type === 'sculpture') {
    typeText = 'Sculpture';
    TypeIcon = Box;
  }

  const hasMultipleSlides = slides.length > 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay (Sert de zone de fermeture au clic) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={skipAll}
          />
          
          {/* Panel d'information */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-black text-white overflow-y-auto"
          >
            {/* Bouton fermer (X) */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white hover:bg-white/10"
              onClick={skipAll}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* 🖼️ Zone d'affichage de l'Image/Vidéo/Fallback */}
            {artwork.image ? (
              // Affichage si une image (preview) est fournie dans ExhibitionData.js
              <div className="relative h-72 overflow-hidden">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>
            ) : (artwork.type === 'glb' || artwork.type === 'youtube' || artwork.type === 'sculpture') ? (
              // Icône de remplacement si aucune image fournie pour les GLB/Vidéos
              <div className="h-48 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-900">
                <TypeIcon className="h-20 w-20 text-white/20" />
                <span className="mt-2 text-white/50 text-sm">{typeText}</span>
              </div>
            ) : null}

            {/* Contenu */}
            <div className="p-8">
              {/* Type d'œuvre */}
              <div className="flex items-center gap-2 mb-4">
                <TypeIcon className="h-4 w-4 text-white/50" />
                <span className="text-xs uppercase tracking-widest text-white/50">
                  {typeText}
                </span>
              </div>

              {/* Titre et Artiste */}
              <h2 className="text-3xl font-light text-white mb-2">{artwork.title}</h2>
              <p className="text-lg text-white/70 mb-6">{artwork.artist}</p>

              {/* Ligne décorative */}
              <div className="w-16 h-px bg-white/20 mb-6" />

              {/* Description paginée */}
              <p className="text-white/80 leading-relaxed mb-4 whitespace-pre-line">
                {slides[currentSlide] || "Aucune description disponible."}
              </p>

              {/* Boutons navigation */}
              {hasMultipleSlides && (
                  <div className="flex justify-between mt-4 gap-4 mb-6">
                      <Button
                        onClick={goPrev}
                        disabled={currentSlide === 0}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-sm"
                      >
                        Précédent
                      </Button>

                      <div className="flex items-center text-sm text-white/70">
                          {currentSlide + 1} / {slides.length}
                      </div>

                      <Button
                        onClick={goNext}
                        className="px-6 py-3 bg-white/25 hover:bg-white/40 text-white border border-white/40 rounded-sm flex items-center gap-2"
                      >
                        {currentSlide < slides.length - 1 ? "Suivant" : "Terminer"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                  </div>
              )}
              
              {/* Bouton Fermer si pas de pagination */}
              {!hasMultipleSlides && (
                  <Button
                    onClick={skipAll}
                    className="w-full px-6 py-3 bg-white/25 hover:bg-white/40 text-white border border-white/40 rounded-sm"
                  >
                    Fermer
                  </Button>
              )}


              {/* Métadonnées */}
              <div className="space-y-4 text-white/70 pt-6 border-t border-white/10 mt-6">
                
                {artwork.year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{artwork.year}</span>
                  </div>
                )}
                {artwork.medium && (
                  <div className="flex items-center gap-3">
                    <Palette className="h-4 w-4" />
                    <span className="text-sm">{artwork.medium}</span>
                  </div>
                )}
                {artwork.dimensions && (
                  <div className="flex items-center gap-3">
                    <Ruler className="h-4 w-4" />
                    <span className="text-sm">{artwork.dimensions}</span>
                  </div>
                )}

                {/* Lieu de conservation */}
                {artwork.location && (
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4" /> 
                    <span className="text-sm">Lieu de conservation : {artwork.location}</span>
                  </div>
                )}

                {/* Numéro d'inventaire */}
                {artwork.inventoryNumber && (
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4" />
                    <span className="text-sm">Numéro d'inventaire : {artwork.inventoryNumber}</span>
                  </div>
                )}
                
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}