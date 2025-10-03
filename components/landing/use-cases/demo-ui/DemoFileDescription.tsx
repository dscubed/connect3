import { motion } from "framer-motion";

export default function DemoFileDescription({
  file,
  delay,
}: {
  file: { file_id: string; description: string };
  delay: number;
}) {
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
