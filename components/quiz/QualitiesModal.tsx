'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import personalities, { Personality } from '@/data/personalities';

const characterImageMapping: Record<string, string> = {
  "Purple C3": "/quiz/characters/purple/single.png",
  "Green Squiggle": "/quiz/characters/green/single.png",
  "Yellow Dorito": "/quiz/characters/yellow/single.png",
  "Blue Square": "/quiz/characters/blue/single.png",
  "Round Peach": "/quiz/characters/orange/single.png",
  "Pink Star": "/quiz/characters/pink/single.png",
};

interface QualitiesModalProps {
  personalityName: string;
  open: boolean;
  onClose: () => void;
}

function getPersonality(name: string): Personality | undefined {
  return personalities.find((p) => p.name === name);
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-base leading-snug">
            <span className="shrink-0 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function QualitiesModal({ personalityName, open, onClose }: QualitiesModalProps) {
  const personality = getPersonality(personalityName);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || !personality) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="z-10 flex flex-col bg-[#1a1a2e] text-white rounded-2xl w-full max-w-md max-h-[calc(100dvh-32px)] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 pb-3 bg-[#1a1a2e] rounded-t-2xl border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image
              src={characterImageMapping[personality.name]}
              alt={personality.name}
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
            <div>
              <h2 className="text-2xl font-bold">{personality.alias}</h2>
              <p className="text-base text-white/60 leading-none">{personality.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-5 overflow-y-auto">
          <p className="text-base leading-relaxed text-white/80">{personality.description}</p>

          <Section title="Strengths" items={personality.strengths} />
          <Section title="Weaknesses" items={personality.weaknesses} />
          <Section title="Student Habits" items={personality.habits} />
        </div>
      </div>
    </div>
  );
}
