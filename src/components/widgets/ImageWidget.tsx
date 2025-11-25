'use client';
import Image from 'next/image';
import { ImageWidgetProperties, PlaylistItem } from '@/lib/types';
import { useState, useEffect } from 'react';

interface MediaPlaylistWidgetProps {
  properties: ImageWidgetProperties;
}

export default function MediaPlaylistWidget({ properties }: MediaPlaylistWidgetProps) {
  const { playlist } = properties;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!playlist || playlist.length === 0) return;

    const currentItem = playlist[currentIndex];
    const durationInMs = currentItem.duration * 1000;

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    }, durationInMs);

    return () => clearTimeout(timer);
  }, [currentIndex, playlist]);

  if (!playlist || playlist.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        <p>Empty Playlist</p>
      </div>
    );
  }

  const currentItem = playlist[currentIndex];
  
  if (currentItem.type === 'image') {
    return (
      <div className="w-full h-full relative bg-muted">
        <Image
          src={currentItem.url}
          alt={`Playlist image ${currentIndex + 1}`}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }

  if (currentItem.type === 'video') {
    return (
      <div className="w-full h-full relative bg-black">
        <video
          key={currentItem.id}
          src={currentItem.url}
          autoPlay
          muted
          loop={playlist.length === 1}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-red-200">
      <p>Unsupported media type</p>
    </div>
  );
}
