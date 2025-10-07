import AnimatedLogos from "./AnimatedLogos";
import React, { useState, useEffect } from "react";

interface LogoAnimatedProps {
  width?: number;
  height?: number;
  fill?: string;
  className?: string;
  cycleDuration?: number; // Duration in seconds for complete cycle (default: 1.5)
  delay?: number; // Delay in seconds between cycles (default: 2)
  onHover?: boolean; // If true, only animates on hover instead of auto-cycling
  hovering?: boolean; // If true, indicates the logo is currently being hovered
}

export default function LogoAnimated({
  width,
  height,
  fill,
  className,
  onHover = false,
  cycleDuration = 0.6,
  delay = 2,
  hovering = false,
}: LogoAnimatedProps) {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(1);
  const [isDelaying, setIsDelaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    setIsHovered(hovering);
  }, [hovering]);

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

    // Start cycling based on conditions
    const shouldCycle = onHover ? isHovered : true;

    if (shouldCycle) {
      startCycle();
    } else {
      // Reset to first logo when not cycling
      setCurrentLogoIndex(1);
      setIsDelaying(false);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(delayTimeout);
    };
  }, [cycleDuration, delay, logoKeys.length, onHover, isHovered]);

  // Get the current logo component
  const CurrentLogo =
    AnimatedLogos[`logo${currentLogoIndex}` as keyof typeof AnimatedLogos];

  const handleMouseEnter = () => {
    if (onHover && isHovered) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (onHover && isHovered) {
      setIsHovered(false);
    }
  };

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CurrentLogo width={width} height={height} fill={fill} />
      {/* Optional: show delay indicator */}
      {isDelaying && <div className="sr-only">Cycling paused...</div>}
    </div>
  );
}
