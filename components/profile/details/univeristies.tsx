import React from "react";
import { UniversityLogos } from "./UniversitySVG";

export type University = "unimelb" | "uwa" | "monash" | "rmit" | "others";
export type City =
  | "melbourne"
  | "perth"
  | "sydney"
  | "brisbane"
  | "adelaide"
  | "others";

export interface UniversityInfo {
  name: string;
  city: City;
  logo?: React.ReactNode;
}

export const universities: Record<University, UniversityInfo> = {
  unimelb: {
    name: "University of Melbourne",
    city: "melbourne",
    logo: UniversityLogos.unimelb,
  },
  uwa: {
    name: "University of Western Australia",
    city: "perth",
    logo: UniversityLogos.uwa,
  },
  monash: {
    name: "Monash University",
    city: "melbourne",
    logo: UniversityLogos.monash,
  },
  rmit: {
    name: "RMIT University",
    city: "melbourne",
    logo: UniversityLogos.rmit,
  },
  others: {
    name: "Other University",
    city: "others",
    logo: UniversityLogos.others,
  },
};
