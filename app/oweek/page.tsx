'use client';

import { Fredoka } from 'next/font/google';
import QuestionPage from '@/components/oweek/QuestionPage';
import { getQuestions } from '@/data/oweek-questions';
import Image from 'next/image';
import WhiteLogo from '@/public/white-logo.png';
import { useMemo } from 'react';

const fredoka = Fredoka({ subsets: ['latin'] });

export default function Page() {
  const questions = useMemo(() => getQuestions(7), []);

  const handleFinish = (answers: Record<number, string[] | string>) => {
    // TODO: Submit form data
    console.log('Form submitted!', answers);
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
        <button className="bg-white text-[#8C4AF7] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white/90 transition-colors">
          Share Quiz
        </button>
      </div>
    </main>
  );
}
