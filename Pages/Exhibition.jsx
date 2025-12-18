import React, { useState, useCallback } from 'react';
// Note: J'ai laissé les chemins locaux, mais ils sont très longs.
import ExhibitionCanvas from "..Components/exhibition/ExhibitionCanvas.jsx";
import IntroOverlay from "../Components/exhibition/IntroOverlay.jsx";
import RoomCartel from "../Components/exhibition/RoomCartel.jsx";
import ArtworkPanel from "../Components/exhibition/ArtworkPanel.jsx";
import AudioManager from "../Components/exhibition/AudioManager.jsx";
import ControlsHelp from "../Components/exhibition/ControlsHelp.jsx";
import { ROOMS_CONFIG } from "../Components/exhibition/ExhibitionData.js";

export default function Exhibition() {
  // États de l'application
  const [hasStarted, setHasStarted] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('room0');
  const [showCartel, setShowCartel] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [wallsVisible, setWallsVisible] = useState(true);
  const [visitedRooms, setVisitedRooms] = useState(new Set(['room0']));

  // --- LOG GLOBAL POUR DEBUG ---
  console.log({
    hasStarted,
    currentRoom,
    showCartel,
    selectedArtwork,
    wallsVisible,
    visitedRooms: Array.from(visitedRooms)
  });

  // Démarrer l'expérience
  const handleStart = useCallback(() => {
    console.log("Bouton Entrer cliqué");
    setHasStarted(true);
    setShowCartel(true); 
  }, []);

  // Changement de salle
  const handleRoomChange = useCallback((roomId) => {
    console.log("Changement de salle vers :", roomId);
    setCurrentRoom(roomId);
    
    // Afficher le cartel si c'est la première visite de la salle
    if (!visitedRooms.has(roomId) && roomId !== 'room0') {
      setShowCartel(true);
      setVisitedRooms(prev => new Set([...prev, roomId]));
      console.log("Nouvelle salle visitée :", roomId);
    }
  }, [visitedRooms]);

  // Clic sur une œuvre
  const handleArtworkClick = useCallback((artwork) => {
    console.log("Artwork cliqué :", artwork);
    setSelectedArtwork(artwork);
  }, []);

  // Fermer le panel d'œuvre
  const handleCloseArtwork = useCallback(() => {
    console.log("Fermeture panel œuvre");
    setSelectedArtwork(null);
  }, []);

  // Fermer le cartel
  const handleDismissCartel = useCallback(() => {
    console.log("Cartel fermé");
    setShowCartel(false);
  }, []);

  // Toggle visibilité des murs
  const handleToggleWalls = useCallback(() => {
    console.log("Toggle murs :", !wallsVisible);
    setWallsVisible(prev => !prev);
  }, [wallsVisible]);

  const currentRoomConfig = ROOMS_CONFIG[currentRoom];
  const isOverlayOpen = !!selectedArtwork || showCartel; // Définir un état global d'overlay

  console.log("Render Exhibition", { hasStarted, currentRoom });

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      {/* Écran d'introduction */}
      <IntroOverlay 
        isVisible={!hasStarted} 
        onStart={handleStart} 
      />

      {/* Canvas 3D */}
      {/* 🛑 CORRECTION ICI : isActive est toujours TRUE et on utilise isOverlayOpen */}
      {hasStarted && (
        <ExhibitionCanvas
          onRoomChange={handleRoomChange}
          onArtworkClick={handleArtworkClick}
          wallsVisible={wallsVisible}
          isActive={true} // TOUJOURS TRUE pour ne jamais démonter la scène
          isOverlayOpen={isOverlayOpen} // Bloque les contrôles si un panneau est ouvert
        />
      )}

      {/* Cartel de salle (Doit avoir un z-index élevé) */}
      <RoomCartel
        room={currentRoomConfig}
        isVisible={showCartel}
        onDismiss={handleDismissCartel}
      />

      {/* Panel d'information sur l'œuvre (Doit avoir un z-index élevé) */}
      <ArtworkPanel
        artwork={selectedArtwork}
        isVisible={!!selectedArtwork}
        onClose={handleCloseArtwork}
      />

      {/* Indicateur de salle actuelle */}
      {hasStarted && !isOverlayOpen && (
        <div className="fixed top-6 left-6 z-30">
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="text-white/70 text-sm tracking-wider">
              {currentRoomConfig?.name || 'Hall'}
            </span>
          </div>
        </div>
      )}

      {/* Réticule central */}
      {hasStarted && !isOverlayOpen && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="w-2 h-2 border border-white/50 rounded-full" />
        </div>
      )}

      {/* Contrôles d'aide et options */}
      {hasStarted && (
        <ControlsHelp 
          onToggleWalls={handleToggleWalls}
          wallsVisible={wallsVisible}
        />
      )}

      {/* Gestionnaire audio */}
      <AudioManager 
        currentRoom={currentRoom}
        isActive={hasStarted}
      />

      {/* Instructions au premier démarrage */}
      {hasStarted && !isOverlayOpen && (
        <div className="fixed bottom-6 left-6 z-30">
          <p className="text-white/30 text-xs">
            Flèches ou ZQSD pour se déplacer • Maintenez le clic pour regarder autour
          </p>
        </div>
      )}
    </div>
  );
}
