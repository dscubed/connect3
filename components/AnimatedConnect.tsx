import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const options = ["THREE", "3"];

const AnimatedConnect = () => {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(options[0]);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Cursor blink
  useEffect(() => {
    const blink = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(blink);
  }, []);

  // Cycle every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % options.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animate typing/deleting
  useEffect(() => {
    const target = options[index];
    let i = display.length;
    let timeoutId: ReturnType<typeof setTimeout>;

    const deleteStep = () => {
      if (i > 0) {
        i--;
        setDisplay((prev) => prev.slice(0, -1));
        timeoutId = setTimeout(deleteStep, 180);
      } else {
        timeoutId = setTimeout(typeStep, 350);
      }
    };

    const typeStep = () => {
      if (i < target.length) {
        setDisplay(target.slice(0, i + 1));
        i++;
        timeoutId = setTimeout(typeStep, 120);
      }
    };

    deleteStep();
    return () => clearTimeout(timeoutId);
  }, [index]);

  return (
    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
      connect
      <sup className="align-super text-lg">
        {display}
        <motion.span
          animate={{ opacity: cursorVisible ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          _
        </motion.span>
      </sup>
    </h1>
  );
};

export default AnimatedConnect;
