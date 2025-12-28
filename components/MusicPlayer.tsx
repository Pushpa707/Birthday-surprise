
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Music, Pause, Play, Volume2, SkipBack, SkipForward, VolumeX, AlertCircle } from 'lucide-react';

interface Track {
  name: string;
  mood: string;
  url: string;
}

// Using more reliable direct MP3 links to prevent "no supported sources" errors
const TRACK_LIST: Track[] = [
  { 
    name: 'Celestial Birthday Waltz', 
    mood: 'Birthday Magic', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
  },
  { 
    name: 'Midnight Serenade', 
    mood: 'Lo-fi Vibe', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' 
  },
  { 
    name: 'Starlight Waltz', 
    mood: 'Ethereal', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' 
  },
  { 
    name: 'Dreamy Nebula', 
    mood: 'Ambient', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' 
  },
];

const MAGIC_SFX_URL = 'https://www.fesliyanstudios.com/play-mp3/6510'; // Magical chime/sparkle effect

export interface MusicPlayerRef {
  play: () => void;
  setTrack: (index: number) => void;
  playMagicSfx: () => void;
}

const MusicPlayer = forwardRef<MusicPlayerRef, {}>((_, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACK_LIST[currentTrackIndex];

  useImperativeHandle(ref, () => ({
    play: () => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.warn("Autoplay blocked or playback failed", err);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    },
    setTrack: (index: number) => {
      if (index >= 0 && index < TRACK_LIST.length) {
        setHasError(false);
        setCurrentTrackIndex(index);
        // Force reload of audio element for new source
        if (audioRef.current) {
          audioRef.current.load();
          if (isPlaying) {
            audioRef.current.play().catch(() => setIsPlaying(false));
          }
        }
      }
    },
    playMagicSfx: () => {
      try {
        const sfx = new Audio(MAGIC_SFX_URL);
        sfx.volume = isMuted ? 0 : Math.min(volume * 1.5, 1); 
        sfx.play().catch(err => console.log("SFX playback failed", err));
      } catch (e) {
        console.error("Magic SFX Error", e);
      }
    }
  }));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => setHasError(true));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setHasError(false);
    const nextIndex = (currentTrackIndex + 1) % TRACK_LIST.length;
    setCurrentTrackIndex(nextIndex);
  };

  const prevTrack = () => {
    setHasError(false);
    const prevIndex = (currentTrackIndex - 1 + TRACK_LIST.length) % TRACK_LIST.length;
    setCurrentTrackIndex(prevIndex);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleAudioError = () => {
    console.error(`Error loading audio source: ${currentTrack.url}`);
    setHasError(true);
    setIsPlaying(false);
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-4 bg-black/80 backdrop-blur-2xl border border-pink-500/30 p-3 rounded-3xl text-white transition-all duration-500 group ${showControls ? 'pr-6' : 'pr-4 shadow-[0_0_30px_rgba(236,72,153,0.15)]'}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="flex flex-col min-w-[120px]">
        <span className={`text-[10px] uppercase tracking-widest font-bold ${hasError ? 'text-red-400' : 'text-pink-400 animate-pulse'}`}>
          {hasError ? 'Source Error' : currentTrack.mood}
        </span>
        <span className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
          {hasError ? 'Failed to load track' : currentTrack.name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={prevTrack}
          className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Previous Track"
        >
          <SkipBack size={16} />
        </button>
        
        <button 
          onClick={togglePlay}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg ${hasError ? 'bg-red-500 shadow-red-500/20' : 'bg-pink-500 shadow-pink-500/20'}`}
        >
          {hasError ? <AlertCircle size={20} /> : (isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />)}
        </button>

        <button 
          onClick={nextTrack}
          className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Next Track"
        >
          <SkipForward size={16} />
        </button>
      </div>

      <div className={`flex items-center gap-3 overflow-hidden transition-all duration-500 ${showControls ? 'w-32 opacity-100 ml-2' : 'w-0 opacity-0'}`}>
        <button onClick={toggleMute} className="text-pink-300 hover:text-pink-100 transition-colors">
          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input 
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
      </div>

      <audio 
        ref={audioRef} 
        loop 
        src={currentTrack.url}
        onEnded={nextTrack}
        onError={handleAudioError}
        preload="auto"
      />
    </div>
  );
});

export default MusicPlayer;
