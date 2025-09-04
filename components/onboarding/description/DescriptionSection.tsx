import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";

interface DescriptionSectionProps {
  value: string;
  onChange: (value: string) => void;
  onWordCountChange?: (count: number) => void;
}

export default function DescriptionSection({
  value,
  onChange,
  onWordCountChange,
}: DescriptionSectionProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Initialize word count when component mounts or value changes
  useEffect(() => {
    const count = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    setWordCount(count);
    onWordCountChange?.(count);
  }, [value, onWordCountChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange(text);
    const count = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    setWordCount(count);
    onWordCountChange?.(count);
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="relative max-w-2xl mx-auto"
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`relative rounded-3xl border-2 transition-all duration-300 ${
            isFocused
              ? "border-white/40 bg-white/8"
              : "border-white/20 bg-white/5"
          } backdrop-blur-md overflow-hidden`}
        >
          <motion.div
            className="absolute inset-0 rounded-3xl"
            animate={{
              boxShadow: isFocused
                ? "0 0 40px 2px rgba(255,255,255,0.1) inset"
                : "0 0 20px 1px rgba(255,255,255,0.05) inset",
            }}
            transition={{ duration: 0.3 }}
          />

          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: isFocused ? 360 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <FileText className="h-6 w-6 text-white/60" />
              </motion.div>
              <h3 className="text-white font-semibold">
                Tell us about yourself
              </h3>
            </div>

            <textarea
              value={value}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Write naturally about your experiences, projects, or what you're passionate about... Even favourite foods, sports, activities you name it."
              className="w-full h-40 bg-transparent text-white placeholder:text-white/40 resize-none outline-none leading-relaxed"
              style={{ fontSize: "16px" }}
            />

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
              <p className="text-white/50 text-sm">
                Write as much or as little as you&nbsp;d like ( {">"} 10 words)
              </p>
              <motion.div
                animate={{ opacity: wordCount > 0 ? 1 : 0.5 }}
                className="text-white/60 text-sm"
              >
                {wordCount} words
              </motion.div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-4 pointer-events-none"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  style={{
                    left: `${10 + i * 15}%`,
                    top: `${5 + i * 10}%`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="text-center">
        <p className="text-white/50 text-sm max-w-lg mx-auto">
          Expand on what you uploaded, share your passions, or describe what
          you&nbsp;re working on. Write as naturally as you would like.
        </p>
      </div>
    </div>
  );
}
