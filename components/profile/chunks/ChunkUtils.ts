export interface ChunkData {
  id: string;
  profile_id: string;
  text: string;
  category: AllCategories;
  order: number;
  created_at: Date;
}

export interface CategoryOrderData {
  profile_id: string;
  category: AllCategories;
  order: number;
}

export const userCategoriesList = [
  "Education",
  "Experience",
  "Languages",
  "Skills",
  "Projects",
  "Certifications",
  "Courses",
  "Honors",
  "Hobbies",
  "Volunteering",
] as const;

export type UserCategories = (typeof userCategoriesList)[number];

export const organisationCategoriesList = [
  "Recruitment",
  "What we do",
  "Projects",
  "Perks",
] as const;

export type OrganisationCategories =
  (typeof organisationCategoriesList)[number];

export const allCategoriesList = [
  ...userCategoriesList,
  ...organisationCategoriesList,
];
export type AllCategories = (typeof allCategoriesList)[number];

// State Types
export interface ProfileChunk {
  id: string;
  text: string;
  category: AllCategories;
  order: number;
}

export type ChunkInput = {
  id: string;
  text: string;
  category: AllCategories;
};

export interface ChunkEntry {
  id: string;
  text: string;
  order: number;
}

export interface CategoryChunks {
  category: AllCategories;
  chunks: ChunkEntry[];
}

export type FocusDirection = "next" | "back";
