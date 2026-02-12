'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { ChevronLeft, ChevronRight, DownloadIcon } from 'lucide-react';
import blueBg from '@/public/quiz/background/common/blue.png';
import '@splidejs/react-splide/css';

const CARDS = [1, 2, 3]; // Dummy cards

export default function StoryViewer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const splideRef = useRef<any>(null);

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

  const aspectRatio = blueBg.width / blueBg.height;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Container */}
      <div 
        className="relative w-full mx-auto overflow-hidden rounded-2xl shadow-md bg-black/50"
        style={{ 
          aspectRatio: `${blueBg.width} / ${blueBg.height}`,
          maxWidth: `min(28rem, calc((100svh - 72px - 40px - 32px) * ${aspectRatio}))`,
          width: '100%'
        }}
      >
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {CARDS.map((_, idx) => (
            <div 
              key={idx} 
              className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div 
                className={`h-full bg-white transition-all duration-300 ${
                  idx <= currentIndex ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Content Area with Swipe */}
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
                {CARDS.map((card, index) => (
                  <SplideSlide key={index} className="w-full h-full">
                    <div className="w-full h-full relative bg-black/10">
                  {/* Background Image */}
                  <Image
                    src={blueBg}
                    alt="Background"
                    fill
                    className="object-cover -z-10"
                    priority={index === 0}
                  />
                  
                  {/* Card Content Placeholder */}
                  <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-8 text-white">
                    <h2 className="text-3xl font-bold mb-4">Card {index + 1}</h2>
                    <p className="text-center opacity-80">
                       Content goes here. Swipe or use arrows to navigate.
                    </p>
                  </div>
                </div>
              </SplideSlide>
                ))}
              </ul>
            </div>
          </Splide>
        </div>

        {/* Navigation Buttons (Desktop/Overlay) */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        {currentIndex < CARDS.length - 1 && (
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
            // ref={buttonRef}
            // onClick={toggleQR}
            className="bg-white text-[#8C4AF7] px-3 pr-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-white/90 transition-colors shadow-lg"
          >
            <DownloadIcon size={24} />
            Save Slide
          </button>
      </div>
    </div>
  );
}
