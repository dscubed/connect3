import AnimatedLogos from "./AnimatedLogos";
import React, { useState, useEffect } from "react";

interface LogoAnimatedProps {
  width?: number;
  height?: number;
  fill?: string;
  className?: string;
  cycleDuration?: number; // Duration in seconds for complete cycle (default: 1.5)
  delay?: number; // Delay in seconds between cycles (default: 2)
}

export default function LogoAnimated({
  width,
  height,
  fill,
  className,
  cycleDuration = 1,
  delay = 2,
}: LogoAnimatedProps) {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(1);
  const [isDelaying, setIsDelaying] = useState(false);

  // Array of logo keys for easy cycling
  const logoKeys = [
    "logo1",
    "logo2",
    "logo3",
    "logo4",
    "logo5",
    "logo6",
    "logo7",
    "logo8",
    "logo9",
    "logo10",
    "logo11",
    "logo12",
    "logo13",
    "logo14",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let delayTimeout: NodeJS.Timeout;

    const startCycle = () => {
      setIsDelaying(false);
      setCurrentLogoIndex(1); // Reset to first logo

      // Calculate interval time: total duration / number of logos
      const intervalTime = (cycleDuration * 1000) / logoKeys.length;

      let cycleCount = 0;

      interval = setInterval(() => {
        cycleCount++; // Move this outside of setCurrentLogoIndex

        setCurrentLogoIndex((prev) => {
          const nextIndex = prev >= 14 ? 1 : prev + 1;
          return nextIndex;
        });

        // Check if we've completed a full cycle (14 logos)
        if (cycleCount >= logoKeys.length) {
          clearInterval(interval);
          setIsDelaying(true);

          // Start delay before next cycle
          delayTimeout = setTimeout(() => {
            startCycle();
          }, delay * 1000);
        }
      }, intervalTime);
    };

    // Start the first cycle
    startCycle();

    return () => {
      clearInterval(interval);
      clearTimeout(delayTimeout);
    };
  }, [cycleDuration, delay, logoKeys.length]);

  // Get the current logo component
  const CurrentLogo =
    AnimatedLogos[`logo${currentLogoIndex}` as keyof typeof AnimatedLogos];

  return (
    <div className={className}>
      <CurrentLogo width={width} height={height} fill={fill} />
      {/* Optional: show delay indicator */}
      {isDelaying && <div className="sr-only">Cycling paused...</div>}
    </div>
  );
}
