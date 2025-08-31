import React from "react";

export interface ChipProps {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

const Chip: React.FC<ChipProps> = ({ label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full border text-sm transition shadow-sm hover:shadow-md hover:scale-105 ${
      active
        ? "border-white/40 bg-white/10 text-white shadow-white/10"
        : "border-white/10 text-white/80 hover:border-white/30 hover:text-white hover:bg-white/5"
    }`}
  >
    {label}
  </button>
);

export default Chip;
