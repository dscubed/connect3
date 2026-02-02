'use client';

import { useState } from 'react';

export default function QuestionPage({
  category,
  choices,
}: {
  category: string;
  choices: string[];
}) {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

  const toggleChoice = (choice: string) => {
    setSelectedChoices((prev) =>
      prev.includes(choice)
        ? prev.filter((c) => c !== choice)
        : [...prev, choice]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{category}</h1>

        <div className="flex flex-wrap gap-3 mb-8">
          {choices.map((choice) => {
            const isSelected = selectedChoices.includes(choice);
            return (
              <button
                key={choice}
                onClick={() => toggleChoice(choice)}
                className={`
                  px-6 py-3 rounded-full font-medium text-lg
                  transition-all duration-200 ease-in-out
                  transform hover:scale-105 active:scale-95
                  ${
                    isSelected
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-white text-gray-900 shadow-md hover:shadow-lg'
                  }
                `}
              >
                {choice}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <button className="text-gray-600 font-medium text-lg hover:text-gray-900">
            Skip
          </button>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">
              {selectedChoices.length} selected
            </span>
            <button
              className="bg-gray-900 text-white rounded-full p-4 hover:bg-gray-800 transition-colors shadow-lg"
              aria-label="Continue"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
