'use client';

import { Fredoka } from 'next/font/google';
import QuestionPage from '@/components/quiz/QuestionPage';
import { getQuestions } from '@/data/quiz-questions';
import Image from 'next/image';
import WhiteLogo from '@/public/white-logo.png';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GlobeIcon } from 'lucide-react';
import StoryViewer from '@/components/quiz/StoryViewer';

const fredoka = Fredoka({ subsets: ['latin'] });

const STORAGE_KEY = 'quiz-progress';

function loadProgress() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProgress(data: Record<string, unknown>) {
  try {
    const existing = loadProgress() ?? {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {
    // ignore storage errors
  }
}

function matchCharacter(
  _answers: Record<number, string[] | string>
): { character: string; reason: string } {
  // TODO: implement actual matching logic
  return {
    character: 'yellow',
    reason: 'You are a bright and cheerful person!',
  };
}

function QRCode({ width }: { width: number }) {
  return (
    <div className="bg-white p-1 rounded-lg shadow-lg flex items-center justify-center overflow-clip" style={{ width }}>
      <Image
        src="/quiz/qr.jpg"
        alt="QR Code"
        width={width}
        height={width}
      />
    </div>
  );
}

export default function Page() {
  const questions = useMemo(() => getQuestions(1), []);
  const [showQR, setShowQR] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  const [hydrated, setHydrated] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<{ character: string; reason: string } | null>(null);
  const [initialAnswers, setInitialAnswers] = useState<Record<number, string[] | string> | undefined>();
  const [initialIndex, setInitialIndex] = useState<number | undefined>();

  useEffect(() => {
    const saved = loadProgress();
    if (saved?.status === 'completed') {
      setCompleted(true);
      setResult({ character: saved.character, reason: saved.reason });
    } else if (saved) {
      setInitialAnswers(saved.answers);
      setInitialIndex(saved.currentIndex);
    }
    setHydrated(true);
  }, []);

  const handleStep = (currentIndex: number, answer: string[] | string) => {
    saveProgress({ currentIndex: currentIndex + 1, answers: { ...loadProgress()?.answers, [currentIndex]: answer } });
  };

  const handleFinish = (answers: Record<number, string[] | string>) => {
    const { character, reason } = matchCharacter(answers);
    saveProgress({ status: 'completed', answers, character, reason });
    setResult({ character, reason });
    setCompleted(true);
  };

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleTitleTap = useCallback(() => {
    tapCountRef.current += 1;
    clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
      return;
    }
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 600);
  }, []);

  const toggleQR = () => {
    if (!showQR && buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
    setShowQR((prev) => !prev);
  };

  return (
    <main className={`min-h-svh w-screen flex flex-col bg-gradient-to-bl from-[#dfcbff] to-[#5817c1] noise ${fredoka.className}`}>
      <div className="sticky top-0 flex justify-between items-center gap-4 p-4 h-max w-full bg-transparent backdrop-blur-md z-50">
        <div className="flex gap-3 items-center">
          <Image onClick={handleTitleTap} src={WhiteLogo} alt="White Logo" className="w-8" />
          <h1 className="text-white/90 font-medium text-lg mx-auto leading-tight select-none cursor-default">
            Personality Quiz
          </h1>
        </div>

        <div className="relative w-max">
          <div
            className={`absolute top-full left-0 mt-2 transition-all duration-300 ease-out ${
              showQR
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-8 pointer-events-none'
            }`}
            style={{ width: buttonWidth }}
          >
            <QRCode width={buttonWidth} />
          </div>

          <button
            ref={buttonRef}
            onClick={toggleQR}
            className="bg-white text-[#8C4AF7] px-2 pr-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-white/90 transition-colors shadow-lg"
          >
            <GlobeIcon size={24} />
            Share Quiz
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 my-auto">
        <div className="w-full max-w-lg mx-auto">
          {!hydrated ? null : completed && result ? (
            <StoryViewer />
          ) : (
            <QuestionPage
              key={hydrated ? 'loaded' : 'init'}
              questions={questions}
              initialAnswers={initialAnswers}
              initialIndex={initialIndex}
              onNext={handleStep}
              onFinish={handleFinish}
            />
          )}

        </div>
      </div>
    </main>
  );
}
