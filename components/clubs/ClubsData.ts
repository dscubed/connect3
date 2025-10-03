export interface ClubData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  fullDescription: string;
  focus: string[];
  activities: string[];
  goals: string[];
  leadership?: {
    president?: string;
    secretary?: string;
    treasurer?: string;
  };
  contact: {
    address?: string;
    email?: string;
  };
  links: {
    website?: string;
    umsu?: string;
  };
  color: string;
  bgGradient: string;
  established?: string;
}

export const clubsData: ClubData[] = [
  {
    id: "hackmelbourne",
    name: "HackMelbourne",
    tagline: "Innovation through code and community",
    description:
      "Student-run club dedicated to making tech accessible to everyone.",
    fullDescription:
      "HackMelbourne is a student-run club at the University of Melbourne dedicated to making tech and hacking accessible to everyone through education and community building. We run workshops, social events, and annual hackathons to connect students with the tech industry and foster innovation. Whether you're a complete beginner or an experienced developer, HackMelbourne welcomes you to learn, create, and connect.",
    focus: [
      "Hackathons",
      "Software Development",
      "Innovation & Technology",
      "Industry Networking",
    ],
    activities: [
      "Technical workshops and tutorials on web, mobile, and software development",
      "Social events and networking opportunities with industry professionals",
      "Annual cross-university hackathons with prizes and mentorship",
      "Industry collaboration sessions and company visits",
      "Beginner-friendly coding bootcamps",
      "Project showcase events",
    ],
    goals: [
      "Make tech and hacking accessible to all students regardless of background",
      "Promote web, mobile, and software development learning",
      "Connect students with industry professionals and career opportunities",
      "Run a large-scale, free, cross-university hackathon annually",
      "Build a supportive community of tech enthusiasts",
    ],
    contact: {
      address: "Mailbox 94, Level 4, Building 168, University of Melbourne",
      email: "contact@hack.melbourne",
    },
    links: {
      website: "https://hack.melbourne/",
      umsu: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/hackmelbourne/",
    },
    color: "bg-black",
    bgGradient: "from-gray-900 via-black to-gray-900",
    established: "2015",
  },
  {
    id: "misc",
    name: "Melbourne Information Security Club",
    tagline: "Securing the future, one student at a time",
    description: "Dedicated to cybersecurity education for all skill levels.",
    fullDescription:
      "The University of Melbourne Information Security Club (MISC), founded in 2017, is dedicated to cybersecurity education for students of all skill levels. We provide hands-on training, host CTF competitions, and create a community where students can learn about the latest security trends and build practical skills in penetration testing, cryptography, and defensive security. Join us to explore the exciting world of ethical hacking and cybersecurity.",
    focus: [
      "Cybersecurity & Information Security",
      "Practical Skills Development",
      "CTF Competitions",
      "Ethical Hacking",
      "Industry Connections",
    ],
    activities: [
      "Hands-on security workshops covering various cybersecurity topics",
      "Capture The Flag (CTF) competitions for skill-building",
      "Guest speaker sessions with industry security experts",
      "Social networking events to connect with peers and professionals",
      "Training sessions for security certifications",
      "Collaborative security projects",
    ],
    goals: [
      "Provide hands-on cybersecurity experience to all students",
      "Build professional networks in the security industry",
      "Prepare students for cybersecurity careers and certifications",
      "Foster a welcoming community for all skill levels",
      "Promote ethical hacking and responsible disclosure",
    ],
    leadership: {
      president: "Sarah Chen",
      secretary: "Alex Kumar",
      treasurer: "Emma Davis",
    },
    contact: {
      address: "Computing and Information Systems, University of Melbourne",
      email: "contact@umisc.club",
    },
    links: {
      website:
        "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7902/",
      umsu: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7902/",
    },
    color: "bg-blue-600",
    bgGradient: "from-blue-600 via-blue-700 to-blue-800",
    established: "2017",
  },
  {
    id: "raid",
    name: "RAID",
    tagline: "Responsible Artificial Intelligence Development",
    description: "Building a community around responsible AI development.",
    fullDescription:
      "RAID (Responsible Artificial Intelligence Development) is a student club at the University of Melbourne focused on building a community around responsible AI development, bridging technical expertise with ethical considerations. We believe that the future of AI depends on developers who understand both the technical possibilities and ethical implications of their work. Through workshops, debates, and hands-on projects, we empower students to become responsible AI practitioners.",
    focus: [
      "AI Ethics & Responsibility",
      "Technical AI Development",
      "Societal Impact of AI",
      "Machine Learning",
      "Policy & Governance",
    ],
    activities: [
      "Educational workshops on responsible AI (no experience required)",
      "Practical AI project teams working on real-world challenges",
      "Ethics debates and discussions on AI's societal impact",
      "Industry and academic collaboration opportunities",
      "Guest lectures from AI ethics researchers",
      "Hackathons focused on responsible AI solutions",
    ],
    goals: [
      "Educate students in responsible AI development practices",
      "Assemble student teams for practical AI projects with ethical considerations",
      "Foster discussion and debate on ethical AI issues",
      "Bridge technical and ethical AI understanding",
      "Connect with academia and industry leaders in AI ethics",
      "Build student confidence and reduce imposter syndrome in AI",
    ],
    leadership: {
      president: "Nathan Luo",
      secretary: "Mohammad Rehman",
      treasurer: "Tvisha Merchant",
    },
    contact: {
      address: "Level 4, Building 168, University of Melbourne",
      email: "contact@raidmelb.au",
    },
    links: {
      website: "https://www.raidmelb.au/",
      umsu: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/6573/",
    },
    color: "bg-purple-600",
    bgGradient: "from-purple-600 via-purple-700 to-indigo-700",
    established: "2023",
  },
  {
    id: "dscubed",
    name: "DSCubed",
    tagline: "Data Science for Social Good",
    description: "Empowering students to use data science for positive impact.",
    fullDescription:
      "DSCubed is the University of Melbourne's premier data science club, dedicated to fostering a community of data enthusiasts who want to use their skills for social good. We provide hands-on learning opportunities, industry connections, and collaborative projects that make a real difference. From machine learning to data visualization, we cover the full spectrum of data science while always keeping our focus on creating positive social impact.",
    focus: [
      "Data Science & Analytics",
      "Machine Learning",
      "Social Impact Projects",
      "Data Visualization",
      "Industry Partnerships",
    ],
    activities: [
      "Weekly technical workshops on data science topics",
      "Industry networking events with top companies",
      "Collaborative data science projects with nonprofits",
      "Kaggle competitions and data challenges",
      "Guest lectures from data science professionals",
      "Study groups and peer learning sessions",
    ],
    goals: [
      "Build a supportive community of data science learners",
      "Provide practical experience through real-world projects",
      "Connect students with industry opportunities",
      "Promote the use of data science for social good",
      "Make data science accessible to students from all backgrounds",
    ],
    leadership: {
      president: "Michael Zhang",
      secretary: "Priya Patel",
      treasurer: "James Wilson",
    },
    contact: {
      address:
        "School of Computing and Information Systems, University of Melbourne",
      email: "contact@dscubed.org.au",
    },
    links: {
      website: "https://www.dscubed.org.au/",
      umsu: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/dscubed/",
    },
    color: "bg-cyan-600",
    bgGradient: "from-cyan-600 via-blue-600 to-blue-700",
    established: "2018",
  },
];
