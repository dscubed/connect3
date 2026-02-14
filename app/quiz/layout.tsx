import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personality Quiz | Connect3",
  description: "Take the Connect3 personality quiz to discover your character and find your match!",
  openGraph: {
    title: "Personality Quiz | Connect3",
    description: "Take the Connect3 personality quiz to discover your character and find your match!",
  },
  twitter: {
    card: "summary_large_image",
    title: "Personality Quiz | Connect3",
    description: "Take the Connect3 personality quiz to discover your character and find your match!",
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
