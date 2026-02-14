'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown, X } from 'lucide-react';

export type QuestionType = 'single' | 'multiple' | 'text' | 'textarea' | 'studentemail' | 'single-dropdown' | 'multi-dropdown';

export interface Question {
  id?: string;
  title: string;
  choices?: string[];
  choicesMap?: Record<string, string[]>;
  dependsOn?: string;
  type?: QuestionType;
}

interface QuestionPageProps {
  questions: Question[];
  onFinish?: (answers: Record<number, string[] | string>) => void;
  onNext?: (currentIndex: number, answer: string[] | string) => void;
  onBack?: (currentIndex: number) => void;
  initialAnswers?: Record<number, string[] | string>;
  initialIndex?: number;
}

interface InputProps {
  choices?: string[];
  value: string[] | string;
  onChange: (val: string[] | string) => void;
}

function SingleChoiceInput({ choices = [], value, onChange }: InputProps) {
  const selectedValue = Array.isArray(value) ? value[0] : value;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
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
    <div className="flex flex-wrap gap-3 w-full">
      {choices.map((choice) => {
        const isSelected = selectedValues.includes(choice);
        return (
          <motion.button
            key={choice}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleChoice(choice)}
            className={cn(
              "px-4 py-2 rounded-full text-md font-medium transition-all duration-200 shadow-md",
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
    <div className="w-full">
      <input
        autoComplete="off"
        data-bwignore
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
    <div className="w-full">
      <textarea
        value={textValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full h-48 rounded-lg bg-white/20 text-white placeholder:text-white/60 p-4 text-lg focus:outline-none focus:ring-2 focus:ring-white resize-none"
      />
    </div>
  );
}

function DropdownInput({ choices = [], value, onChange, single = false }: InputProps & { single?: boolean }) {
  const [open, setOpen] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState<number>(300);
  const selectedValues = Array.isArray(value) ? value : [];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (open && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom - 16;
        setMenuMaxHeight(Math.max(100, spaceBelow));
      }
    };

    if (open) {
      updateHeight();
      window.addEventListener('resize', updateHeight);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleChoice = (choice: string) => {
    if (single) {
      if (selectedValues.includes(choice)) {
        // Optional: Allow deselect by clicking again? 
        // For standard dropdowns, usually clicking selected item keeps it selected or does nothing.
        // But since we can remove via tag, let's just close.
        setOpen(false);
      } else {
        onChange([choice]);
        setOpen(false);
      }
    } else {
      if (selectedValues.includes(choice)) {
        onChange(selectedValues.filter((c) => c !== choice));
      } else {
        onChange([...selectedValues, choice]);
      }
    }
  };

  const removeChoice = (e: React.MouseEvent, choice: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter((c) => c !== choice));
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full min-h-[60px] rounded-lg bg-white/20 text-white p-3 flex flex-wrap gap-2 items-center cursor-pointer transition-all duration-200 border border-transparent",
          open ? "ring-2 ring-white bg-white/30" : "hover:bg-white/30"
        )}
      >
        {selectedValues.length === 0 && (
          <span className="text-white/60 px-1">Select options...</span>
        )}
        
        {selectedValues.map((val) => (
          <span
            key={val}
            className="bg-white text-[#8C4AF7] pl-3 pr-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm"
          >
            {val}
            <button
              onClick={(e) => removeChoice(e, val)}
              className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </span>
        ))}
        
        <div className="ml-auto pl-2">
          <ChevronsUpDown className="h-5 w-5 text-white/50" />
        </div>
      </div>

      <AnimatePresence>
        {open && (
           <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{ maxHeight: menuMaxHeight }}
            className="absolute top-full left-0 w-full mt-2 rounded-lg bg-[#2A1748] overflow-hidden z-50 shadow-xl overflow-y-auto"
          >
            {choices.map((choice) => {
              const isSelected = selectedValues.includes(choice);
              return (
                <div
                  key={choice}
                  onClick={() => toggleChoice(choice)}
                  className={cn(
                    "p-3 cursor-pointer flex items-center justify-between text-white transition-colors border-b border-white/5 last:border-0",
                    isSelected ? "bg-white/20" : "hover:bg-white/10"
                  )}
                >
                  <span className="font-medium">{choice}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
              );
            })}
            {choices.length === 0 && (
              <div className="p-4 text-center text-white/50">
                No options available
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function validateStudentEmail(email: string) {
  if (typeof email !== 'string') return false;
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
    // && email.toLowerCase().endsWith('.edu.au');
}

export default function QuestionPage({
  questions,
  onFinish,
  onNext,
  onBack,
  initialAnswers,
  initialIndex,
}: QuestionPageProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[] | string>>(initialAnswers ?? {});

  const currentQuestion = questions[currentIndex];
  // Ensure we fail safely if question is undefined (e.g. empty array)
  if (!currentQuestion) return null;

  const currentType = currentQuestion.type || 'single';
  
  // Get current answer or default
  const currentAnswer = answers[currentIndex] ?? (currentType === 'text' ? '' : []);

  // Resolve choices for dependent questions
  let effectiveChoices = currentQuestion.choices;
  if (currentQuestion.dependsOn && currentQuestion.choicesMap) {
    const depIndex = questions.findIndex(q => q.id === currentQuestion.dependsOn);
    if (depIndex !== -1) {
      const depAnswer = answers[depIndex];
      const depValue = Array.isArray(depAnswer) ? depAnswer[0] : depAnswer;
      effectiveChoices = depValue ? (currentQuestion.choicesMap[depValue] ?? []) : [];
    }
  }

  const handleAnswerChange = (val: string[] | string) => {
    const newAnswers = { ...answers, [currentIndex]: val };
    if (currentQuestion.id) {
      questions.forEach((q, idx) => {
        if (q.dependsOn === currentQuestion.id) {
          delete newAnswers[idx];
        }
      });
    }
    setAnswers(newAnswers);
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
              choices={effectiveChoices} 
              value={currentAnswer} 
              onChange={handleAnswerChange} 
            />
          )}
          {currentType === 'multiple' && (
            <MultiChoiceInput 
              choices={effectiveChoices} 
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
          {(currentType === 'multi-dropdown' || currentType === 'single-dropdown') && (
            <DropdownInput 
              choices={effectiveChoices} 
              value={currentAnswer} 
              onChange={handleAnswerChange}
              single={currentType === 'single-dropdown'}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-2 w-full mt-3">
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
