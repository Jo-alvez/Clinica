import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils';

interface PhotoComparatorProps {
  beforeUrl: string;
  afterUrl: string;
  className?: string;
}

export const PhotoComparator: React.FC<PhotoComparatorProps> = ({ beforeUrl, afterUrl, className }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };

  const onMouseDown = () => setIsResizing(true);
  const onMouseUp = () => setIsResizing(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isResizing) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isResizing) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full aspect-[4/3] overflow-hidden rounded-2xl cursor-col-resize select-none border border-slate-200", className)}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
    >
      {/* After Image (Background) */}
      <img 
        src={afterUrl} 
        alt="Depois"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before Image (Overlay) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img 
          src={beforeUrl} 
          alt="Antes"
          className="absolute inset-0 aspect-[4/3] w-[initial] h-full object-cover max-w-none"
          style={{ width: containerRef.current?.offsetWidth }}
        />
      </div>

      {/* Slider Bar */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] z-10"
        style={{ left: `${sliderPos}%` }}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
            <div className="w-0.5 h-3 bg-slate-400 rounded-full" />
            <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest z-20">
        Antes
      </div>
      <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest z-20">
        Depois
      </div>
    </div>
  );
};
