export interface ClubData {
  id: string;
  name: string;
  location: string;
  description: string;
  fullDescription: string;
  contact: {
    address?: string;
    email?: string;
  };
  links: {
    website?: string;
    umsu?: string;
  };
  established?: string;
  logoUrl?: string;
}

export const clubsData: ClubData[] = [
  {
    id: "hackmelbourne",
    name: "HackMelbourne",
    location: "Melbourne, Australia",
    description:
      "Student-run club dedicated to making tech accessible to everyone.",
    fullDescription:
      "HackMelbourne is a student-run club at the University of Melbourne dedicated to making tech and hacking accessible to everyone through education and community building. We run workshops, social events, and annual hackathons to connect students with the tech industry and foster innovation. Whether you're a complete beginner or an experienced developer, HackMelbourne welcomes you to learn, create, and connect.",
    contact: {
      address: "Mailbox 94, Level 4, Building 168, University of Melbourne",
      email: "contact@hack.melbourne",
    },
    links: {
      website: "https://hack.melbourne/",
      umsu: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/hackmelbourne/",
    },
    established: "2015",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/hackmelbourne.png",
  },
  {
    id: "misc",
    name: "Melbourne Information Security Club",
    location: "Melbourne, Australia",
    description: "Dedicated to cybersecurity education for all skill levels.",
    fullDescription:
      "The University of Melbourne Information Security Club (MISC), founded in 2017, is dedicated to cybersecurity education for students of all skill levels. We provide hands-on training, host CTF competitions, and create a community where students can learn about the latest security trends and build practical skills in penetration testing, cryptography, and defensive security. Join us to explore the exciting world of ethical hacking and cybersecurity.",
    contact: {
      address: "Computing and Information Systems, University of Melbourne",
      email: "contact@umisc.club",
    },
    links: {
      website:
        "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7902/",
      umsu: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7902/",
    },
    established: "2017",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/misc.png",
  },
  {
    id: "raid",
    name: "RAID",
    location: "Melbourne, Australia",
    description: "Building a community around responsible AI development.",
    fullDescription:
      "RAID (Responsible Artificial Intelligence Development) is a student club at the University of Melbourne focused on building a community around responsible AI development, bridging technical expertise with ethical considerations. We believe that the future of AI depends on developers who understand both the technical possibilities and ethical implications of their work. Through workshops, debates, and hands-on projects, we empower students to become responsible AI practitioners.",
    contact: {
      address: "Level 4, Building 168, University of Melbourne",
      email: "contact@raidmelb.au",
    },
    links: {
      website: "https://www.raidmelb.au/",
      umsu: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/6573/",
    },
    established: "2023",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/raid.png",
  },
  {
    id: "dscubed",
    name: "DSCubed",
    location: "Melbourne, Australia",
    description: "Empowering students to use data science for positive impact.",
    fullDescription:
      "DSCubed is the University of Melbourne's premier data science club, dedicated to fostering a community of data enthusiasts who want to use their skills for social good. We provide hands-on learning opportunities, industry connections, and collaborative projects that make a real difference. From machine learning to data visualization, we cover the full spectrum of data science while always keeping our focus on creating positive social impact.",
    contact: {
      address:
        "School of Computing and Information Systems, University of Melbourne",
      email: "contact@dscubed.org.au",
    },
    links: {
      website: "https://www.dscubed.org.au/",
      umsu: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/dscubed/",
    },
    established: "2018",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/dscubed.png",
  },
];
