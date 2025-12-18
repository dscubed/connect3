"use client";
import { motion } from "framer-motion";

interface FileDescriptionProps {
  file: {
    file_id: string;
    summary: string;
  };
  delay: number;
}

export default function FileDescription({ file, delay }: FileDescriptionProps) {
  return (
    <motion.p
      key={file.file_id}
      className="pl-11 text-muted"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
      }}
    >
      {file.summary}
    </motion.p>
  );
}
