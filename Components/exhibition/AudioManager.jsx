import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Slider } from "./Slider";
import { Button } from "./Button";

// URLs des sons d'ambiance (remplacer par vos propres fichiers)
const AUDIO_SOURCES = {
  ambient_hall: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
  ambient_cosmos: 'https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3',
  ambient_body: 'https://assets.mixkit.co/music/preview/mixkit-spirit-in-the-woods-139.mp3',
  ambient_mind: 'https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3'
};

export default function AudioManager({ currentRoom, isActive }) {
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef(null);
  const previousRoom = useRef(currentRoom);

  // Initialiser l'audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume / 100;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Changer de piste selon la salle
  useEffect(() => {
    if (!audioRef.current || !isActive) return;

    const roomConfig = {
      room0: 'ambient_hall',
      room1: 'ambient_cosmos',
      room2: 'ambient_body',
      room3: 'ambient_mind'
    };

    const soundKey = roomConfig[currentRoom] || 'ambient_hall';
    const newSrc = AUDIO_SOURCES[soundKey];

    if (previousRoom.current !== currentRoom) {
      // Fade out puis change
      const fadeOut = setInterval(() => {
        if (audioRef.current.volume > 0.05) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
        } else {
          clearInterval(fadeOut);
          audioRef.current.src = newSrc;
          audioRef.current.load();
          audioRef.current.play().then(() => {
            // Fade in
            const fadeIn = setInterval(() => {
              const targetVol = isMuted ? 0 : volume / 100;
              if (audioRef.current.volume < targetVol - 0.05) {
                audioRef.current.volume = Math.min(targetVol, audioRef.current.volume + 0.05);
              } else {
                audioRef.current.volume = targetVol;
                clearInterval(fadeIn);
              }
            }, 50);
          }).catch(() => {});
        }
      }, 50);
      
      previousRoom.current = currentRoom;
    }
  }, [currentRoom, isActive, volume, isMuted]);

  // Démarrer l'audio au premier clic utilisateur
  const startAudio = useCallback(() => {
    if (audioRef.current && !audioReady) {
      const soundKey = 'ambient_hall';
      audioRef.current.src = AUDIO_SOURCES[soundKey];
      audioRef.current.volume = volume / 100;
      audioRef.current.play().then(() => {
        setAudioReady(true);
      }).catch(() => {});
    }
  }, [audioReady, volume]);

  useEffect(() => {
    if (isActive && !audioReady) {
      document.addEventListener('click', startAudio, { once: true });
      return () => document.removeEventListener('click', startAudio);
    }
  }, [isActive, audioReady, startAudio]);

  // Mettre à jour le volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const VolumeIcon = isMuted ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`
        flex items-center gap-3 bg-black/80 backdrop-blur-md rounded-full 
        px-4 py-3 transition-all duration-300 border border-white/10
        ${isExpanded ? 'w-48' : 'w-14'}
      `}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10 shrink-0"
          onClick={toggleMute}
        >
          <VolumeIcon className="h-5 w-5" />
        </Button>
        
        {isExpanded && (
          <Slider
            value={[volume]}
            onValueChange={(val) => setVolume(val[0])}
            max={100}
            step={1}
            className="w-24"
          />
        )}
      </div>
      
      {!audioReady && isActive && (
        <div className="absolute -top-12 right-0 bg-white/90 text-black text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
          Cliquez pour activer le son
        </div>
      )}
    </div>
  );
}