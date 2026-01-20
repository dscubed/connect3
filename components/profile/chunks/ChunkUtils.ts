export interface ChunkData {
  id: string;
  profile_id: string;
  text: string;
  category: AllCategories;
  order: number;
  created_at: Date;
}

export interface CategoryOrderData {
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

// Category Descriptions

export interface CategoryDescription {
  name: AllCategories;
  description: string;
}

export const userCategoryDescriptions: CategoryDescription[] = [
  {
    name: "Education",
    description:
      "Details about formal education, degrees, institutions, start/graduation dates.",
  },
  {
    name: "Experience",
    description:
      "Professional/Club work experience, job titles, companies, responsibilities, dates.",
  },
  {
    name: "Languages",
    description: "Languages known along with proficiency levels.",
  },
  {
    name: "Skills",
    description: "Technical and soft skills.",
  },
  {
    name: "Projects",
    description:
      "Significant projects undertaken, descriptions, technologies used, outcomes. Link to project (if available).",
  },
  {
    name: "Certifications",
    description:
      "Professional certifications/licenses, issuing organizations, dates.",
  },
  {
    name: "Courses",
    description:
      "Relevant courses completed, institutions, dates/undertaken at, course codes.",
  },
  {
    name: "Honors",
    description:
      "Awards, honors, recognitions received, issuing bodies, dates.",
  },
  {
    name: "Hobbies",
    description: "Personal interests and hobbies that showcase personality.",
  },
  {
    name: "Volunteering",
    description:
      "Volunteer work, organizations, roles, responsibilities, dates.",
  },
];

export const userCategoryDescriptionText = userCategoryDescriptions
  .map((cat) => `- ${cat.name}: ${cat.description}`)
  .join("\n");

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
