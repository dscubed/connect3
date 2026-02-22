"use server";

import OpenAI from "openai";
import personalities from "@/data/personalities";
import { Question } from "@/components/quiz/QuestionPage";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const personalitySummaries = personalities
  .map(
    (p) =>
      `### ${p.name} - "${p.alias}"\n${p.description}\nStrengths: ${p.strengths.join("; ")}\nWeaknesses: ${p.weaknesses.join("; ")}\nHabits: ${p.habits.join("; ")}`
  )
  .join("\n\n");

const SYSTEM_PROMPT = `You are a personality matcher for a university student quiz app called Connect3.

You will be given a set of quiz questions and the student's answers. Based on their answers, match them to ONE of the following personality characters.

Each character has multiple strengths, weaknesses, and student habits. When selecting the trait, strength, and weakness, pick the ones that most closely relate to patterns in the user's specific answers — not just the character's most prominent traits in general. The selected trait, strength, and weakness should feel personally relevant to the student based on what they chose.

Here are the possible characters:

${personalitySummaries}

You MUST respond with valid JSON in this exact format:
{
  "name": "<character name exactly as listed, e.g. Purple C3>",
  "alias": "<character alias exactly as listed, e.g. The Alpha>",
  "description": "<the character's full description, copied word for word>",
  "summary": "<a summary of the character's description in exactly 1 sentence, max 20 words>",
  "trait": "<the single most relevant student habit from the matched character based on the user's answers>",
  "strength": "<the single most relevant strength from the matched character based on the user's answers>",
  "weakness": "<the single most relevant weakness from the matched character based on the user's answers>",
  "standout": "<one short sentence (max 15 words) addressed to 'you', listing exactly 3 factual observations directly inferred from their specific answers — do NOT describe personality traits or relate to any character, instead reference what they actually chose, e.g. 'You're into gym and coding, prefer leading groups, and always show up to class'>"
}

Do not include any text outside the JSON object.`;

export type MatchResult = {
  name: string;
  alias: string;
  description: string;
  summary: string;
  trait: string;
  strength: string;
  weakness: string;
  standout: string;
};

export async function generateMatch(
  questions: Question[],
  answers: Record<number, string[] | string>
): Promise<MatchResult> {
  const formattedQA = questions
    .map((q, i) => {
      if (q.type === "studentemail") return null;
      const answer = answers[i];
      const answerStr = Array.isArray(answer) ? answer.join(", ") : answer;
      return `Q: ${q.title}\nA: ${answerStr || "(no answer)"}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Here are the student's quiz responses:\n\n${formattedQA}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const fallback = personalities[0];

  try {
    const parsed = JSON.parse(content);
    const matched = personalities.find((p) => p.name === parsed.name);
    const character = matched ?? fallback;

    return {
      name: character.name,
      alias: character.alias,
      description: character.description,
      summary: parsed.summary ?? `${character.alias} — ${character.description.split(".")[0]}.`,
      trait: parsed.trait ?? character.habits[0],
      strength: parsed.strength ?? character.strengths[0],
      weakness: parsed.weakness ?? character.weaknesses[0],
      standout: parsed.standout ?? "Your answers showed a unique perspective.",
    };
  } catch {
    return {
      name: fallback.name,
      alias: fallback.alias,
      description: fallback.description,
      summary: `${fallback.alias} — ${fallback.description.split(".")[0]}.`,
      trait: fallback.habits[0],
      strength: fallback.strengths[0],
      weakness: fallback.weaknesses[0],
      standout: "Your answers showed a unique perspective.",
    };
  }
}
