export type Chunk = {
  chunk_id: string;
  category: string;
  content: string;
};

export const WORD_LIMIT = 50;
export const MAX_CHUNKS = 30;
export const CHUNKS_PER_PAGE = 6;

export const getWordCount = (text: string) =>
  text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

export const templateChunks: Chunk[] = [
  {
    chunk_id: "1",
    category: "Experience",
    content:
      "John Doe worked as a Project Manager at GlobalCorp from 2019 to 2023, leading diverse teams and delivering successful outcomes.",
  },
  {
    chunk_id: "2",
    category: "Education",
    content:
      "John Doe graduated from University of California in 2018 with a degree in Business Administration.",
  },
  {
    chunk_id: "3",
    category: "Community & Volunteering",
    content:
      "John Doe volunteered at City Food Bank from 2020 to 2022, organizing donation drives and supporting local families.",
  },
  {
    chunk_id: "4",
    category: "Skills & Interests",
    content:
      "John Doe is skilled in data analysis, public speaking, and enjoys hiking, photography, and learning new languages.",
  },
  {
    chunk_id: "5",
    category: "Achievements",
    content:
      "John Doe received the 'Community Impact Award' in 2021 for outstanding contributions to local initiatives.",
  },
];
