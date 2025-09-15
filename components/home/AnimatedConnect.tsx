import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const options = ["THREE", "3"];

const AnimatedConnect = () => {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(options[0]);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Cursor blink only when typing/deleting
  useEffect(() => {
    if (!isTyping) {
      setCursorVisible(false);
      return;
    }
    setCursorVisible(true);
    const blink = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(blink);
  }, [isTyping]);

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
    let timeoutId: ReturnType<typeof setTimeout>;

    setIsTyping(true);

    const deleteStep = (currentDisplay: string) => {
      if (currentDisplay.length > 0) {
        const newDisplay = currentDisplay.slice(0, -1);
        setDisplay(newDisplay);
        timeoutId = setTimeout(() => deleteStep(newDisplay), 180);
      } else {
        timeoutId = setTimeout(() => typeStep(""), 350);
      }
    };

    const typeStep = (currentDisplay: string) => {
      if (currentDisplay.length < target.length) {
        const newDisplay = target.slice(0, currentDisplay.length + 1);
        setDisplay(newDisplay);
        timeoutId = setTimeout(() => typeStep(newDisplay), 120);
      } else {
        setIsTyping(false);
      }
    };

    // Get current display value using a callback to avoid stale closure
    setDisplay((currentDisplay) => {
      deleteStep(currentDisplay);
      return currentDisplay;
    });

    return () => clearTimeout(timeoutId);
  }, [index]); // Only depend on index

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
