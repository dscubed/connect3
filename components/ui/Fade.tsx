import { AnimatePresence, motion } from "framer-motion";

export function Fade({
  show,
  children,
  className,
  duration = 0.3,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
