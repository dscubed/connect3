'use client';

import { useState } from 'react';

export default function EmailEntry({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValid(validateEmail(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-6 flex items-center justify-center">
      <div className="max-w-lg mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome! 👋</h1>
          <p className="text-xl text-gray-600">
            Let&apos;s get started with your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={handleEmailChange}
              className="w-full h-16 rounded-2xl px-6 text-lg bg-white shadow-md border-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors placeholder:text-gray-400"
            />
            {email && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                {isValid ? (
                  <span className="text-green-500 text-2xl">✓</span>
                ) : (
                  <span className="text-red-500 text-2xl">✗</span>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`
              w-full h-16 rounded-full text-lg font-semibold
              transition-all duration-200 shadow-lg
              ${
                isValid
                  ? 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          We&apos;ll use this to make you a Connect3 account, so you can stay up
          to date with all of the O-week events!
        </p>
      </div>
    </div>
  );
}
