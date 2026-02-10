'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type QuestionType = 'single' | 'multiple' | 'text' | 'textarea' | 'studentemail';

export interface Question {
  title: string;
  choices?: string[];
  type?: QuestionType; // Optional in default data so defaulting to single is useful
}

interface QuestionPageProps {
  questions: Question[];
  onFinish?: (answers: Record<number, string[] | string>) => void;
  onNext?: (currentIndex: number, answer: string[] | string) => void;
  onBack?: (currentIndex: number) => void;
}

interface InputProps {
  choices?: string[];
  value: string[] | string;
  onChange: (val: string[] | string) => void;
}

function SingleChoiceInput({ choices = [], value, onChange }: InputProps) {
  const selectedValue = Array.isArray(value) ? value[0] : value;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-4">
      {choices.map((choice) => {
        const isSelected = selectedValue === choice;
        return (
          <motion.button
            key={choice}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange([choice])}
            className={cn(
              "h-32 rounded-lg text-lg font-medium transition-all duration-200 p-4 flex items-center justify-center relative overflow-hidden group",
              isSelected
                ? "bg-white/40 ring-2 ring-white text-white border-transparent"
                : "bg-white/20 hover:bg-white/20 text-white border-white/10"
            )}
          >
            <span className="relative z-10 text-center leading-tight">{choice}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function MultiChoiceInput({ choices = [], value, onChange }: InputProps) {
  const selectedValues = Array.isArray(value) ? value : [];

  const toggleChoice = (choice: string) => {
    if (selectedValues.includes(choice)) {
      onChange(selectedValues.filter((c) => c !== choice));
    } else {
      onChange([...selectedValues, choice]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 w-full mb-4">
      {choices.map((choice) => {
        const isSelected = selectedValues.includes(choice);
        return (
          <motion.button
            key={choice}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleChoice(choice)}
            className={cn(
              "px-4 py-2 rounded-full text-lg font-medium transition-all duration-200 shadow-md",
              isSelected
                ? "bg-white text-[#8C4AF7]"
                : "bg-white/30 text-white hover:bg-white/30"
            )}
          >
            {choice}
          </motion.button>
        );
      })}
    </div>
  );
}

function TextInput({ value, onChange }: InputProps) {
  const textValue = typeof value === 'string' ? value : '';
  
  return (
    <div className="w-full mb-4">
      <input
        value={textValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full rounded-lg bg-white/20 text-white placeholder:text-white/60 indent-4 py-4 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-white"
      />
    </div>
  );
}

function TextareaInput({ value, onChange }: InputProps) {
  const textValue = typeof value === 'string' ? value : '';
  
  return (
    <div className="w-full mb-4">
      <textarea
        value={textValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full h-48 rounded-lg bg-white/20 text-white placeholder:text-white/60 p-4 text-lg focus:outline-none focus:ring-2 focus:ring-white resize-none"
      />
    </div>
  );
}

function validateStudentEmail(email: string) {
  if (typeof email !== 'string') return false;
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase()) && email.indexOf('edu.au') > -1;
}

export default function QuestionPage({
  questions,
  onFinish,
  onNext,
  onBack,
}: QuestionPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[] | string>>({});

  const currentQuestion = questions[currentIndex];
  // Ensure we fail safely if question is undefined (e.g. empty array)
  if (!currentQuestion) return null;

  const currentType = currentQuestion.type || 'single';
  
  // Get current answer or default
  const currentAnswer = answers[currentIndex] ?? (currentType === 'text' ? '' : []);

  const handleAnswerChange = (val: string[] | string) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: val }));
  };
  
  const handleNextClick = () => {
    setDirection(1);
    if (onNext) onNext(currentIndex, currentAnswer);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      if (onFinish) onFinish({ ...answers, [currentIndex]: currentAnswer });
    }
  };

  const handleBackClick = () => {
    setDirection(-1);
    if (onBack) onBack(currentIndex);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Check if current question has a valid answer
  let isNextDisabled = currentType === 'text' 
    ? (currentAnswer as string).trim().length === 0
    : (currentAnswer as string[]).length === 0;

  if (currentType === 'studentemail') {
    isNextDisabled = !validateStudentEmail(currentAnswer as string);
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto z-10">
      {/* Progress Chip */}
      <div className="w-max bg-white px-3.5 py-1.5 rounded-full">
        <span className="text-[#8C4AF7] font-semibold tracking-widest">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="w-full"
        >
          {/* Question Title */}
          <h2 className="text-xl font-medium text-white leading-snug max-w-md pt-1 pb-5">
            {currentQuestion.title}
          </h2>

          {/* Inputs */}
          {currentType === 'single' && (
            <SingleChoiceInput 
              choices={currentQuestion.choices} 
              value={currentAnswer} 
              onChange={handleAnswerChange} 
            />
          )}
          {currentType === 'multiple' && (
            <MultiChoiceInput 
              choices={currentQuestion.choices} 
              value={currentAnswer} 
              onChange={handleAnswerChange} 
            />
          )}
          {currentType === 'text' && (
            <TextInput 
              value={currentAnswer} 
              onChange={handleAnswerChange}
              choices={[]} // Unused for keys
            />
          )}
          {currentType === 'textarea' && (
            <TextareaInput 
              value={currentAnswer} 
              onChange={handleAnswerChange}
              choices={[]} // Unused for keys
            />
          )}
          {currentType === 'studentemail' && (
            <TextInput 
              value={currentAnswer}
              onChange={handleAnswerChange}
              choices={[]} // Unused for keys
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-4 w-full mt-auto">
        <button
          onClick={handleBackClick}
          disabled={currentIndex === 0}
          className="flex-1 py-2 rounded-full font-medium text-white bg-[#2A1748] hover:bg-[#3D2266] transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleNextClick}
          disabled={isNextDisabled}
          className="flex-1 py-2 rounded-full font-medium text-[#8C4AF7] bg-white hover:bg-white/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}
