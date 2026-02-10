'use client';

import { Fredoka } from 'next/font/google';
import QuestionPage from '@/components/quiz/QuestionPage';
import { getQuestions } from '@/data/oweek-questions';
import Image from 'next/image';
import WhiteLogo from '@/public/white-logo.png';
import { useMemo, useRef, useState } from 'react';
import { GlobeIcon } from 'lucide-react';

const fredoka = Fredoka({ subsets: ['latin'] });

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
  const questions = useMemo(() => getQuestions(7), []);
  const [showQR, setShowQR] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  const handleFinish = (answers: Record<number, string[] | string>) => {
    // TODO: Submit form data
    console.log('Form submitted!', answers);
  };

  const toggleQR = () => {
    if (!showQR && buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
    setShowQR((prev) => !prev);
  };

  return (
    <main className={`min-h-screen w-screen flex flex-col justify-between gap-4 bg-gradient-to-bl from-[#dfcbff] to-[#5817c1] noise ${fredoka.className}`}>
      <div className="sticky top-0 grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 h-max w-full bg-transparent backdrop-blur-md z-50">
        <Image src={WhiteLogo} alt="White Logo" className="w-8" />
    
        <h1 className="text-white/90 font-medium mx-auto leading-tight">
          O Week Special - Find out your student personality!
        </h1>
      </div>

      <div className="px-4">
        <div className="w-full max-w-lg mx-auto">
          <QuestionPage
            questions={questions}
            onFinish={handleFinish}
          />
        </div>
      </div>

      <div className="sticky bottom-0 p-4">
        <div className="relative w-max">
          <div
            className={`absolute bottom-full left-0 mb-2 transition-all duration-300 ease-out ${
              showQR
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8 pointer-events-none'
            }`}
            style={{ width: buttonWidth }}
          >
            <QRCode width={buttonWidth} />
          </div>

          <button
            ref={buttonRef}
            onClick={toggleQR}
            className="bg-white text-[#8C4AF7] px-2 pr-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-white/90 transition-colors"
          >
            <GlobeIcon size={24} />
            Share Quiz
          </button>
        </div>
      </div>
    </main>
  );
}
