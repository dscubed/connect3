import React from "react";
import Card from "@/components/Card";
import { ArrowDown } from "lucide-react";
import { Person } from "@/components/Card";

export interface PeopleSectionProps {
  people: Person[];
}

const PeopleSection: React.FC<PeopleSectionProps> = ({ people }) => (
  <div className="mt-8">
    <h2 className="text-2xl font-extrabold text-white mb-6 tracking-tight px-10 flex items-center gap-2">
      <span>suggested profiles</span>
      <ArrowDown strokeWidth={4} />
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {people.map((p: Person) => (
        <Card key={p.id} person={p} />
      ))}
      {people.length === 0 && (
        <div className="col-span-full text-center text-white/60 py-12">
          no matches yet...
        </div>
      )}
    </div>
  </div>
);

export default PeopleSection;
