import { useState, useEffect } from "react";

export const useCubeAnimation = (isPaused: boolean) => {
  const [cubeRotate, setCubeRotate] = useState({ x: -10, y: -20, z: 0 });
  const [cube, setCube] = useState({ x: 0, y: -5, z: 0 });

  useEffect(() => {
    let velocity = { x: 0, y: 0, z: 0 };
    let moveVelocity = { x: 0, y: 0, z: 0 };
    let lastDirectionChange = Date.now();
    let frame: number;

    const animate = () => {
      if (!isPaused) {
        // Change direction every 5 seconds
        if (Date.now() - lastDirectionChange > 5000) {
          velocity = {
            x: (Math.random() - 0.5) * 0.08,
            y: (Math.random() - 0.5) * 0.08,
            z: (Math.random() - 0.5) * 0.04,
          };
          moveVelocity = {
            x: (Math.random() - 0.5) * 0.3,
            y: (Math.random() - 0.5) * 0.3,
            z: (Math.random() - 0.5) * 0.15,
          };
          lastDirectionChange = Date.now();
        }
        setCubeRotate((prev) => ({
          x: Math.max(-10, Math.min(10, prev.x + velocity.x)),
          y: Math.max(-20, Math.min(20, prev.y + velocity.y)),
          z: Math.max(-5, Math.min(5, prev.z + velocity.z)),
        }));
        setCube((prev) => ({
          x: Math.max(-10, Math.min(10, prev.x + moveVelocity.x)),
          y: Math.max(-15, Math.min(5, prev.y + moveVelocity.y)),
          z: Math.max(-5, Math.min(5, prev.z + moveVelocity.z)),
        }));
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPaused]);

  return { cubeRotate, cube };
};
