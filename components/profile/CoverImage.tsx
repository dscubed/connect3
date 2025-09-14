import { motion } from "framer-motion";
import Image from "next/image";
import { Edit3 } from "lucide-react";

export default function CoverImage({
  coverImageUrl,
}: {
  coverImageUrl: string | null;
}) {
  return (
    <motion.div
      className="relative h-48 md:h-64 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <Image
        src={
          coverImageUrl ||
          "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/conver_image/sample_cover1.jpg"
        }
        alt="Cover"
        fill
        className="object-cover"
        priority
      />

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />

      {/* Additional edge blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

      {/* Edit Cover Button */}
      <motion.button
        className="absolute top-4 right-4 p-2 rounded-xl bg-black/30 border border-white/20 hover:bg-black/40 transition-all backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Edit3 className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
