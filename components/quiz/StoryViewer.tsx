'use client';

import { useState, useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { ChevronLeft, ChevronRight, DownloadIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import blueBg from '@/public/quiz/background/common/blue.png';
import '@splidejs/react-splide/css';
import { cardData } from './cards/card-data';

export default function StoryViewer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const splideRef = useRef<any>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    if (splideRef.current) {
      splideRef.current.go('>');
    }
  };

  const handlePrev = () => {
    if (splideRef.current) {
      splideRef.current.go('<');
    }
  };

  const handleDownloadSlide = async () => {
    try {
      await document.fonts.ready;

      const slideElement = slideContainerRef.current?.querySelector('.splide__slide.is-active') as HTMLElement;
      if (!slideElement) return;

      const downloadWidth = 1000;
      const pixelRatio = downloadWidth / slideElement.clientWidth;

      const dataUrl = await toPng(slideElement, {
        width: slideElement.clientWidth,
        height: slideElement.clientHeight,
        pixelRatio,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `slide-${currentIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const isDownloadDisabled = currentIndex === 0 || currentIndex === cardData.length - 1;
  const aspectRatio = blueBg.width / blueBg.height;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div 
        ref={slideContainerRef}
        className="relative w-full mx-auto overflow-hidden rounded-2xl shadow-md bg-black/50"
        style={{ 
          aspectRatio: `${blueBg.width} / ${blueBg.height}`,
          maxWidth: `min(28rem, calc((100svh - 72px - 40px - 32px) * ${aspectRatio}))`,
          width: '100%'
        }}
      >
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1.5 p-3">
          {cardData.map((_, idx) => (
            <div 
              key={idx} 
              className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
            >
              <div 
                className={`h-full bg-white transition-all duration-300 ${
                  idx <= currentIndex ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 z-10">
          <Splide
            ref={splideRef}
            options={{
              type: 'slide',
              arrows: false,
              pagination: false,
              drag: true,
              flickMaxPages: 1,
              perMove: 1,
              perPage: 1,
            }}
            onMove={(splide: any, newIndex: number) => {
              setCurrentIndex(newIndex);
            }}
            hasTrack={false}
            className="w-full h-full"
          >
            <div className="splide__track w-full h-full">
              <ul className="splide__list w-full h-full">
                {cardData.map((card, index) => (
                  <SplideSlide key={index} className="w-full h-full">
                    {card}
                  </SplideSlide>
                ))}
              </ul>
            </div>
          </Splide>
        </div>

        {currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        {currentIndex < cardData.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={handleDownloadSlide}
          disabled={isDownloadDisabled}
          className={`bg-white text-[#8C4AF7] px-3 pr-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-white/90 transition-colors shadow-lg ${
            isDownloadDisabled ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <DownloadIcon size={24} />
          Save Slide
        </button>
      </div>
    </div>
  );
}