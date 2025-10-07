export interface ClubData {
  id: string;
  name: string;
  full_name?: string;
  location: string;
  description: string;
  fullDescription: string;
  contact: {
    address?: string;
    email?: string;
  };
  links: {
    website?: string;
    club?: string;
  };
  established?: string;
  logoUrl?: string;
  socials?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    discord?: string;
  };
}

export const clubsData: ClubData[] = [
  // HackMelbourne
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
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/hackmelbourne/",
    },
    established: "2015",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/hackmelbourne.png",
    socials: {
      instagram: "https://www.instagram.com/hack.melbourne/",
      linkedin: "https://www.linkedin.com/company/hackmelbourne/",
      facebook: "https://www.facebook.com/hackmelbourne",
      discord: "https://discord.gg/tEQ5m6ayTV",
    },
  },

  // MISC
  {
    id: "misc",
    name: "MISC",
    full_name: "Melbourne Information Security Club",
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
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7902/",
    },
    established: "2017",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/misc.png",
    socials: {
      instagram: "https://www.instagram.com/unimelb_misc/",
      linkedin:
        "https://www.linkedin.com/company/melbourne-information-security-club/",
      facebook: "https://www.facebook.com/uomisc/",
      discord: "https://discord.com/invite/PybR9kpBMn",
    },
  },

  // RAID
  {
    id: "raid",
    name: "RAID",
    full_name: "Responsible Artificial Intelligence Development",
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
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/6573/",
    },
    established: "2023",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/raid.png",
    socials: {
      instagram: "https://www.instagram.com/raidunimelb",
      linkedin: "https://www.linkedin.com/company/raidunimelb/",
      facebook: "https://www.facebook.com/RAID.Unimelb/",
    },
  },

  // DSCubed
  {
    id: "dscubed",
    name: "DSCubed",
    full_name: "Data Science Students Society",
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
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/dscubed/",
    },
    established: "2018",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/dscubed.png",
    socials: {
      instagram: "https://www.instagram.com/dscubed.unimelb/",
      linkedin: "https://www.linkedin.com/company/dscubed/",
      facebook: "https://www.facebook.com/dscubed.unimelb/",
      discord: "https://discord.gg/Dj8a7P6jXN",
    },
  },

  // CISSA
  {
    id: "cissa",
    name: "CISSA",
    full_name: "Computing and Information Systems Students Association",
    location: "Melbourne, Australia",
    description: "Bridging university and industry",
    fullDescription:
      "The Computing and Information Systems Students Association (CISSA) represents the IT and tech-oriented student community at the University of Melbourne. For those studying Computer Science, Software Engineering, Information Technology or Information Systems, UI/UX Design, and Data Science, we believe joining CISSA is a must, and of course we welcome students from different academic backgrounds too!",
    contact: {
      address:
        "School of Computing and Information Systems, University of Melbourne",
      email: "executives@cissa.org.au",
    },
    links: {
      website: "https://www.cissa.org.au/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/cissa/",
    },
    established: "1992",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/cissa.png",
    socials: {
      facebook: "https://www.facebook.com/cissa.unimelb/",
      instagram: "https://www.instagram.com/cissa_unimelb/",
      linkedin: "https://www.linkedin.com/company/cissa-unimelb/",
      discord: "https://discord.com/invite/Dq9A5GFFBD",
    },
  },

  // UWA DSC
  {
    id: "uwa_dsc",
    name: "DSC",
    full_name: "Data Science Club of UWA",
    location: "Perth, Australia",
    description:
      "Empowering students to explore, learn, and innovate in the world of data science, machine learning, and artificial intelligence.",
    fullDescription:
      "The Data Science club of UWA aims to create a collaborative and professional space for like-minded students looking to take advantage of the power of data to innovate and make a positive impact in the world. Our goal is to promote the interaction between industry professionals and our students to develop and nurture relationships via collaboration, training and the creation of new opportunities.",
    contact: {
      address: " Mathematics Building G15a, UWA",
      email: "dsc.uwa@gmail.com",
    },
    links: {
      website: "https://www.dscuwa.com/",
      club: "https://www.uwastudentguild.com/clubs/data-science-club-of-uwa/",
    },
    established: "N/A",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/uwa_dsc.png",
    socials: {
      facebook: "https://www.facebook.com/dsc.uwa/",
      instagram: "https://www.instagram.com/dscuwa",
      linkedin: "https://www.linkedin.com/company/dscuwa/",
      discord: "https://discord.com/invite/ZBY8jC4cnn",
    },
  },

  // CSSC
  {
    id: "cssc",
    name: "CSSC",
    full_name: "Computer Science Students Club",
    location: "Perth, Australia",
    description:
      "CSSC is the premier UWA computer science club. Join us for a variety of events such as workshop, talks and LAN parties!",
    fullDescription:
      "The Computer Science Students Club (CSSC) runs social, educational and professional events for students in the School of Computer Science and Software Engineering at the University of Western Australia. We provide students with opportunities to meet others with a shared interest or course in computer science. We have a club room in the Computer Science building, near the computer labs. Feel free to use our clubroom to rest, study and enjoy discounted drinks. It has a fridge, microwave, gaming consoles and a PC for computer science students to use. We run events such as sausage sizzles, games nights, laser tag and quiz nights.",
    contact: {
      address: "CSSE building, second floor, room 2.26, UWA",
      email: " cssc@guild.uwa.edu.au",
    },
    links: {
      website: "https://cssc.asn.au/",
      club: "https://www.uwastudentguild.com/clubs/computer-science-students-club",
    },
    established: "N/A",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/cssc.png",
    socials: {
      instagram: "https://www.instagram.com/csscuwaofficial/",
      linkedin: "https://www.linkedin.com/company/csscuwa",
    },
  },

  // UWA AI Club
  {
    id: "uwa_ai",
    name: "UWA AI Club",
    full_name: "UWA Artificial Intelligence Club",
    location: "Perth, Australia",
    description:
      "UWA Artificial Intelligence Club: Technical and non technical workshops, UWA ML team, social events, talks.",
    fullDescription:
      "The UWA Artificial Intelligence Club is a student community for students passionate about artificial intelligence and its impact across industries. We host technical and non technical workshops, informative talks with guest speakers & weekly meetings for the UWA ML team. Our goal is to foster collaboration, learning, and innovation among students at UWA. Join us to connect, share ideas, and explore the future of AI together!",
    contact: {},
    links: {
      website: "https://www.linkedin.com/company/uwa-ai-club",
    },
    established: "N/A",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/uwa_ai.png",
    socials: {
      instagram: "https://www.instagram.com/uwaaiclub/",
      linkedin: "https://www.linkedin.com/company/uwa-ai-club",
    },
  },

  // CFC
  {
    id: "cfc",
    name: "CFC",
    full_name: "Coders for Causes",
    location: "Perth, Australia",
    description: "Innovation with a mission",
    fullDescription:
      "Coders for Causes is a not for profit organization that empowers charities and other not for profit organizations by connecting them with university students to develop technical solutions. We are a student-run club based in Perth, Western Australia with a wide range of clients.",
    contact: {
      email: "hello@codersforcauses.org",
    },
    links: {
      website: "https://codersforcauses.org/",
      club: "https://www.uwastudentguild.com/clubs/coders-for-causes",
    },
    established: "N/A",
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/cfc.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/coders-for-causes/",
      instagram: "https://www.instagram.com/cfc_uwa",
      facebook: "https://www.facebook.com/codersforcauses",
      discord: "https://discord.codersforcauses.org/",
    },
  },
];
