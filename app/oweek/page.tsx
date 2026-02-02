'use client';

import EmailEntry from '@/components/oweek/EmailEntry';
import QuestionPage from '@/components/oweek/QuestionPage';
import { useState, useRef, useEffect } from 'react';
import questionsData from '@/data/oweek-questions.json';

export default function Page() {
  const questionEnd = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const questions = questionsData.questions;

  const handleQuestionChange = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleSubmit = () => {
    // TODO: Submit form data to API
    console.log('Form submitted!');
    // You can navigate to a success page or show a confirmation
  };

  const handleEmailEntry = () => {
    setCurrentIndex(0);
  };

  useEffect(() => {
    if (questionEnd.current) {
      questionEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentIndex]);

  return (
    <div>
      {currentIndex === -1 && <EmailEntry onNext={handleEmailEntry} />}
      {currentIndex >= 0 &&
        questions.slice(0, currentIndex + 1).map((question, index) => {
          const isCurrentQuestion = index === currentIndex;
          const actualQuestionIndex = questions.findIndex(
            (q) => q.title === question.title
          );
          const isLastQuestion = actualQuestionIndex === questions.length - 1;

          return (
            <QuestionPage
              key={question.title}
              title={question.title}
              choices={question.choices}
              onNext={isLastQuestion ? handleSubmit : handleQuestionChange}
              isActive={isCurrentQuestion}
              isLastQuestion={isLastQuestion}
            />
          );
        })}
      <div ref={questionEnd} />
    </div>
  );
}
