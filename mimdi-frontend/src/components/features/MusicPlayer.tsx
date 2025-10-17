'use client';

import { useState, useRef, useEffect } from 'react';
import { Music, MusicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MusicPlayerProps = {
  src: string;
};

export default function MusicPlayer({ src }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Coba putar otomatis saat komponen dimuat
  useEffect(() => {
    const playPromise = audioRef.current?.play();
    if (playPromise !== undefined) {
      playPromise.then(_ => {
        setIsPlaying(true);
      }).catch(error => {
        // Autoplay diblokir oleh browser, ini normal.
        // Pengguna harus berinteraksi terlebih dahulu.
        console.log("Autoplay was prevented:", error);
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop />
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={togglePlayPause}
          size="icon"
          className="rounded-full h-12 w-12 bg-black/50 text-white backdrop-blur-sm hover:bg-black/75 animate-spin"
          style={{ animationDuration: isPlaying ? '3s' : '0s' }}
        >
          {isPlaying ? <Music className="h-6 w-6" /> : <MusicOff className="h-6 w-6" />}
          <span className="sr-only">Toggle Music</span>
        </Button>
      </div>
    </>
  );
}
