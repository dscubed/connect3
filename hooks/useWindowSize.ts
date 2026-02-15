"use client";
import { useState, useEffect } from 'react';

/**
 * Returns the current width and height of the browser window
 * @returns 
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{width?: number, height?: number}>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
