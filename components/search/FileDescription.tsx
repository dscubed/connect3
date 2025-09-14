"use client";
import { motion } from "framer-motion";

interface FileDescriptionProps {
  file: {
    file_id: string;
    description: string;
  };
  delay: number;
}

export default function FileDescription({ file, delay }: FileDescriptionProps) {
  return (
    <motion.p
      key={file.file_id}
      className="pl-11 text-white/80"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
      }}
    >
      {file.description}
    </motion.p>
  );
}
