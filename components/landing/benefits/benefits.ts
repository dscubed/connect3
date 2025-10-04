export interface Benefit {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
}

export const benefits: Benefit[] = [
  {
    id: "discovery",
    category: "Visibility",
    title: "Be Found Instantly",
    description:
      "Students searching for opportunities discover your club automatically. No more hoping they'll stumble upon your Instagram—Connect3 puts you right where they're looking.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=800&fit=crop&q=80", // Students studying/discovering
  },
  {
    id: "reach",
    category: "Growth",
    title: "Reach the Right Students",
    description:
      "Connect with students who are genuinely interested in what you offer. Our AI matches your club with students based on their passions, majors, and career goals.",
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=800&fit=crop&q=80", // University campus aerial view
  },
  {
    id: "engagement",
    category: "Engagement",
    title: "Boost Event Turnout",
    description:
      "Get more students at your events with intelligent reminders and personalized recommendations. Turn one-time visitors into dedicated members.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=800&fit=crop&q=80", // Conference/event gathering
  },
  {
    id: "setup",
    category: "Simplicity",
    title: "Set Up in 60 Seconds",
    description:
      "No complex forms or manual data entry. Just paste your club's website or social media link, and Connect3 does the rest. Start reaching students immediately.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=800&fit=crop&q=80", // Clean tech/coding setup
  },
  {
    id: "analytics",
    category: "Insights",
    title: "Understand Your Members",
    description:
      "See what students are searching for, which events get the most interest, and how your club compares. Make data-driven decisions to grow faster.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=800&fit=crop&q=80", // Analytics dashboard/charts
  },
  {
    id: "automation2",
    category: "Efficiency",
    title: "Let AI Handle the Busywork",
    description:
      "Automatically answer common questions, update event details, and notify interested students. Focus on building community, not managing spreadsheets.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&q=80", // AI/futuristic technology
  },
];
