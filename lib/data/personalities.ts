// Prompt to convert markdown data into JSON:

// Each H3 heading is the name of a character. For each character, there is a description, strengths, weaknesses, and student habits defined. Convert the markdown data into a JSON. You must copy the wording exactly.

// This is the target schema:
// [{
//   name: string, // e.g. "Purple C3"
//   alias: string,  // e.g. "The Alpha"
//   description: string,
//   strengths: string[],
//   weaknesses: string[],
//   habits: string[],
// }]

export type Personality = {
  name: string;
  alias: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  habits: string[];
};

const personalities: Personality[] = [
  {
    name: "Purple C3",
    alias: "The Alpha",
    description:
      "The Alpha is a vision-driven student who treats university as a place to build impact, not just earn grades. They thrive in leadership roles, love big ideas and are constantly turning thoughts into action. Highly respected and influential, they often feel like the \"main character\" of their student ecosystem.",
    strengths: [
      "Exceptional leadership and communication skills",
      "Turns abstract ideas into actionable plans and initiatives",
      "Highly organised using calendars, systems, and planning tools",
      "Strong networker with a polished professional presence",
      "Thinks strategically and long-term",
      "Motivates others and drives momentum in groups",
    ],
    weaknesses: [
      "Chronically overcommits and struggles to prioritise academics",
      "Sacrifices sleep and personal wellbeing",
      "Constantly close to burnout but downplays it",
      "Difficulty slowing down or doing things \"just enough\"",
      "Ties self-worth to productivity and impact",
    ],
    habits: [
      "Runs or is on the exec team of multiple clubs",
      "Colour-coded Google Calendars (plural), Notion dashboards, shared docs",
      "Sends \"quick updates\" that are 8 paragraphs long",
      "Comfortable talking to tutors, lecturers and others for help",
      "Writes essays at 3am fueled by purpose and caffeine",
      "Views university as a platform for building something bigger",
    ],
  },
  {
    name: "Green Squiggle",
    alias: "Curious Gremlin",
    description:
      "The Curious Gremlin is driven by curiosity and learns best through hands-on experience. They may struggle at first, but persistence and creativity carry them forward. University is a space to experiment, fail and grow — often loudly and chaotically.",
    strengths: [
      "Highly resilient and unafraid of failure",
      "Learns deeply through trial, error, and iteration",
      "Brings creative and unconventional perspectives",
      "Energetic, enthusiastic, and curious",
      "Thrives in practical, project-based learning",
      "Will attempt things others hesitate to try",
    ],
    weaknesses: [
      "Inconsistent effort and impulsive work patterns",
      "Poor time management and lack of structure",
      "Misses instructions or details",
      "Can unintentionally disrupt lectures or group focus",
      "Socially unfiltered and unaware at times",
    ],
    habits: [
      "Starts assignments late but goes all in and produces great work",
      "Prefers hands-on activities, workshops and practical sessions",
      "Often forgets deadlines but shows up intensely when it matters",
      "Asks \"dumb\" questions mid-lecture with zero fear",
      "Always bouncing between interests, clubs and projects",
      "Has notebooks full of half-formed ideas and sketches",
    ],
  },
  {
    name: "Yellow Dorito",
    alias: "Shy Cheese",
    description:
      "The Shy Cheese is thoughtful, observant and internally sharp. They understand material quickly and generate strong ideas but rarely voice them. Their university experience is defined more by internal processing than external participation.",
    strengths: [
      "Deep thinker with strong conceptual understanding",
      "Emotionally perceptive and empathetic",
      "Excellent listener and supportive friend",
      "Produces high-quality written or independent work",
      "Loyal and deeply protective of close relationships",
      "Non-judgmental and reflective",
    ],
    weaknesses: [
      "Overthinks and hesitates excessively",
      "Rarely speaks up despite strong ideas",
      "Easily overshadowed in group settings",
      "Internalises stress and self-doubt",
      "Misses opportunities due to fear of taking space",
    ],
    habits: [
      "Sits at the edge or back of lectures",
      "Writes detailed notes no one ever sees",
      "Submits strong assignments quietly",
      "Communicates mostly through text or email rather than in person",
      "Carefully rereads announcements and instructions",
      "Studies alone or with one trusted person",
    ],
  },
  {
    name: "Blue Square",
    alias: "Reliable Tank",
    description:
      "The Reliable Tank is dependable, efficient and grounded. They approach university pragmatically, focusing on completing tasks without fuss. Often the silent backbone of group work, they prioritise responsibility over personal expression.",
    strengths: [
      "Extremely reliable and consistent",
      "Calm under pressure",
      "Highly logical and efficient",
      "Strong team player and natural fallback leader",
      "Emotionally steady and supportive of others",
      "Good at reading social dynamics",
    ],
    weaknesses: [
      "Suppresses personal needs and emotions",
      "Avoids asking for help or clarification",
      "Settles for \"good enough\" rather than excellence",
      "Can feel underappreciated or taken for granted",
      "Struggles with vulnerability and self-advocacy",
    ],
    habits: [
      "Starts assignments the day they're released",
      "Attends all classes consistently and on time",
      "Rarely complains about workload",
      "Doesn't check grades obsessively",
      "Keeps emotions separate from academic responsibilities",
      "Steps up in group work when others hesitate",
    ],
  },
  {
    name: "Round Peach",
    alias: "Social Peach",
    description:
      "The Social Peach thrives on connection and community. University is a social ecosystem where learning happens best together. They bring warmth and cohesion to groups but often struggle with independence.",
    strengths: [
      "Highly approachable and well-liked",
      "Creates inclusive, collaborative environments",
      "Excellent communicator and morale booster",
      "Encourages participation and accountability in groups",
      "Emotionally supportive and attentive",
      "Naturally builds networks and friendships",
    ],
    weaknesses: [
      "Difficulty working or studying alone",
      "Prioritises harmony over honesty",
      "People-pleasing tendencies",
      "Overextends emotionally for others",
      "Risks losing personal goals in group dynamics",
    ],
    habits: [
      "Always studies with others whether at libraries or on call",
      "Instantly creates group chats for classes and assignments",
      "Always plans post-class activities",
      "Chooses classes and tutorials based on friends' schedules",
      "Uses social energy to stay motivated",
      "Has never sat in a lecture alone",
    ],
  },
  {
    name: "Pink Star",
    alias: "Star Student",
    description:
      "The Star Student is a high-achieving all-rounder who excels across academics and extracurriculars. They appear endlessly capable, yet internally feel constant pressure to perform and compare.",
    strengths: [
      "Consistently strong academic performance",
      "Highly disciplined and goal-driven",
      "Confident speaker in lectures and tutorials",
      "Balances multiple commitments effectively",
      "Excellent debater and critical thinker",
      "Inspires others through ambition and drive",
    ],
    weaknesses: [
      "Perfectionistic and comparison-driven",
      "Struggles to rest or feel satisfied",
      "High risk of burnout",
      "Self-worth closely tied to achievement",
      "Fear of falling behind peers",
    ],
    habits: [
      "Raises their hand constantly in every lecture and tute",
      "Downplays achievements while collecting them",
      "Maintains a packed schedule of academics and extracurriculars",
      "Tracks deadlines, grades and achievements meticulously",
      "Constantly compares workload and performance with peers",
      "Updates LinkedIn in real-time",
    ],
  },
];

export default personalities;