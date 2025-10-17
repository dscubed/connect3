type Category =
  | "Tech"
  | "Commerce"
  | "Engineering"
  | "Science"
  | "Cultural"
  | "Start Ups"
  | "Consulting"
  | "Mathematics"
  | "Finance"
  | "Language"
  | "Computing"
  | "Data Science"
  | "Robotics"
  | "Biomedical";

export interface ClubData {
  id: string;
  name: string;
  full_name?: string;
  location: string;
  description: string;
  fullDescription: string;
  category?: Category[];
  links: {
    website?: string;
    club?: string;
  };
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
    category: ["Tech", "Computing"],
    links: {
      website: "https://hack.melbourne/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/hackmelbourne/",
    },
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
    category: ["Tech", "Computing"],
    links: {
      website:
        "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7902/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7902/",
    },
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
    category: ["Tech", "Computing"],
    fullDescription:
      "RAID (Responsible Artificial Intelligence Development) is a student club at the University of Melbourne focused on building a community around responsible AI development, bridging technical expertise with ethical considerations. We believe that the future of AI depends on developers who understand both the technical possibilities and ethical implications of their work. Through workshops, debates, and hands-on projects, we empower students to become responsible AI practitioners.",
    links: {
      website: "https://www.raidmelb.au/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/6573/",
    },
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
    category: ["Tech", "Data Science", "Computing"],
    fullDescription:
      "DSCubed is the University of Melbourne's premier data science club, dedicated to fostering a community of data enthusiasts who want to use their skills for social good. We provide hands-on learning opportunities, industry connections, and collaborative projects that make a real difference. From machine learning to data visualization, we cover the full spectrum of data science while always keeping our focus on creating positive social impact.",
    links: {
      website: "https://www.dscubed.org.au/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/dscubed/",
    },
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
    category: ["Tech", "Computing"],
    fullDescription:
      "The Computing and Information Systems Students Association (CISSA) represents the IT and tech-oriented student community at the University of Melbourne. For those studying Computer Science, Software Engineering, Information Technology or Information Systems, UI/UX Design, and Data Science, we believe joining CISSA is a must, and of course we welcome students from different academic backgrounds too!",
    links: {
      website: "https://www.cissa.org.au/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/cissa/",
    },
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
    category: ["Tech", "Data Science", "Computing"],
    links: {
      website: "https://www.dscuwa.com/",
      club: "https://www.uwastudentguild.com/clubs/data-science-club-of-uwa/",
    },
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
    category: ["Tech", "Computing"],
    links: {
      website: "https://cssc.asn.au/",
      club: "https://www.uwastudentguild.com/clubs/computer-science-students-club",
    },
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
    category: ["Tech", "Computing"],
    fullDescription:
      "The UWA Artificial Intelligence Club is a student community for students passionate about artificial intelligence and its impact across industries. We host technical and non technical workshops, informative talks with guest speakers & weekly meetings for the UWA ML team. Our goal is to foster collaboration, learning, and innovation among students at UWA. Join us to connect, share ideas, and explore the future of AI together!",
    links: {
      website: "https://www.linkedin.com/company/uwa-ai-club",
    },
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
    category: ["Tech", "Computing"],
    fullDescription:
      "Coders for Causes is a not for profit organization that empowers charities and other not for profit organizations by connecting them with university students to develop technical solutions. We are a student-run club based in Perth, Western Australia with a wide range of clients.",
    links: {
      website: "https://codersforcauses.org/",
      club: "https://www.uwastudentguild.com/clubs/coders-for-causes",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/cfc.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/coders-for-causes/",
      instagram: "https://www.instagram.com/cfc_uwa",
      facebook: "https://www.facebook.com/codersforcauses",
      discord: "https://discord.codersforcauses.org/",
    },
  },

  // StartUp Link
  {
    id: "startup_link",
    name: "StartUp Link",
    full_name: "StartUp Link",
    location: "Melbourne, Australia",
    description: "Connecting UniMelb students to the startup world",
    category: ["Commerce", "Start Ups"],
    fullDescription:
      "We are the UniMelb chapter of StartUp Link, a student-led society, aiming to connect young, entrepreneurial minds to opportunities in the startup world through a range of networking, recruitment and skill-development opportunities.",
    links: {
      website: "https://www.startuplinkunimelb.net/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/8055/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/startuplink.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/startuplinkunimelb/",
      instagram: "https://www.instagram.com/startuplinkunimelb",
      facebook: "https://www.facebook.com/startuplinkunimelb/",
    },
  },

  // LEC
  {
    id: "lec",
    name: "LEC",
    full_name: "Language Exchange Club",
    location: "Melbourne, Australia",
    description: "🌏A place for all language learners",
    fullDescription:
      "The Language Exchange Club (LEC) at the University of Melbourne is a student-run, not-for-profit club that provides a social language learning platform for second language learners, from beginner all the way up to advanced or fluent. Our sessions are run by native or fluent speakers of the language and are targeted at both second language learners looking to start or improve their learning, or native speakers looking to practice their mother tongue. Make friends, establish international contacts and improve your language skills naturally! We also run a Language Buddies program, where we match you with a learning partner who knows the language you're learning, and is learning the language you know! That way, you can practice your language skills and meet new people, with the guidance of a native or fluent speaker.",
    category: ["Cultural", "Language"],
    links: {
      website: "https://www.linkedin.com/company/lecmelb/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7085/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/lec.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/lecmelb/",
      instagram: "https://www.instagram.com/lecmelbourne/?hl=en",
      facebook: "https://www.facebook.com/lec.uni/",
    },
  },

  // QFin UWA
  {
    id: "qfin",
    name: "QFin UWA",
    full_name: "Quantitative Finance UWA",
    location: "Perth, Australia",
    description:
      "Providing Western Australian students with practical trading experience.",
    fullDescription:
      "QFin UWA or Quantitative Finance UWA is a mathematical finance club, focused on algorithmic trading and quantitative research. We operate at the intersection of mathematics, finance and computer science by providing students opportunities to develop back-tested algorithmic trading strategies, workshops to develop their research and scientific communication skills and quant finance career-related events. We will provide a medium for science and commerce students to engage with one another and develop their quantitative research skills and financial knowledge..",
    category: ["Commerce", "Mathematics", "Finance"],
    links: {
      website: "https://codersforcauses.org/",
      club: "https://www.uwastudentguild.com/clubs/quantitative-finance-uwa",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/qfin.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/qfin-uwa/",
      instagram: "https://www.instagram.com/qfinuwa/",
      facebook: "https://www.facebook.com/codersforcauses",
    },
  },

  // MUMS
  {
    id: "mums",
    name: "MUMS",
    full_name: "MELBOURNE UNI MATHS AND STATS SOCIETY",
    location: "Melbourne, Australia",
    description:
      "Society for all mathematics and mathematically-interested students at the University of Melbourne.",
    fullDescription:
      "Melbourne University Mathematics and Statistics Society (MUMS) is here to support maths students and promote mathematical interest and learning through a broad range of events and activities. Membership is free, as are all of our events! Our events include: the University Maths Olympics, Puzzle Hunt, trivia nights, BBQs, board game nights, picnics, seminars, first year study groups and much more! We also have a club room, located down the corridor opposite the Peter Hall General Office. All maths students are welcome to come and hang out there, play board games, use the whiteboards, or just nap on the sofas. MUMS welcome anyone with an interest in mathematics and statistics! Our membership is free and open to everyone with all levels of experience in maths. Sign up and be part of this welcoming community!",
    category: ["Mathematics"],
    links: {
      website: "https://www.melbunimathsstats.org/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/mums/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/mums.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/melb-uni-maths-and-stats/?",
      instagram: "https://www.instagram.com/melbunimathsstats/",
      facebook: "https://www.facebook.com/MelbUniMathsStats/",
    },
  },

  // Enactus
  {
    id: "enactus",
    name: "Enactus",
    full_name: "Enactus",
    location: "Melbourne, Australia",
    description:
      "The home for student start-ups at The University of Melbourne",
    fullDescription:
      "We are a community of student, academic and business leaders committed to shaping a better, more sustainable world through entrepreneurship. We ideate and iterate our very own social impact startups, with our vision to create a better more sustainable world in mind. While we emphasize social impact, we welcome all startup enthusiasts, believing that university students have the power to change the world.",
    category: ["Commerce", "Start Ups"],
    links: {
      website: "https://enactusmelbourne.com/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/6653/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/enactus.png",
    socials: {
      linkedin:
        "https://www.linkedin.com/company/enactusunimelb/?originalSubdomain=au",
      instagram: "https://www.instagram.com/enactusunimelb/?hl=en",
      facebook: "https://www.facebook.com/Enactusunimelb/",
    },
  },

  // ass
  {
    id: "ass",
    name: "Actuarial Students Society",
    full_name: "Actuarial Students Society",
    location: "Melbourne, Australia",
    description:
      "The Actuarial Students' Society is the representative body for UoM actuarial students.",
    fullDescription:
      "We are a student society based out of the University of Melbourne that aims to bring actuarial students and actuaries working in the corporate world together. We run a variety of events including information sessions, networking functions and social functions. We are affiliated with both the University of Melbourne's Student Union as well as the Faculty of Business and Economics.",
    category: ["Commerce", "Finance", "Mathematics"],
    links: {
      website: "https://www.melbourneactuary.com/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/6653/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/ass.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/actuarial-students'-society/",
      instagram: "https://www.instagram.com/assmelb/",
      facebook: "https://www.facebook.com/actuarialstudentssociety/",
    },
  },

  // NTU SCDS
  {
    id: "ntu-scds",
    name: "NTU SCDS",
    full_name: "NTU Students' Computing and Data Science Club",
    location: "Singapore",
    description:
      "A student organisation established to improve the welfare and student lives of CCDS Students.",
    fullDescription:
      "The Students' Computing and Data Science (SCDS Club, formerly known as SCSE Club) is a student organisation established to improve the welfare and lives of SCSE Students. We aim to enrich all CCDS students' university lives, meet their needs, and be the voice of CCDS-ians.",
    category: ["Tech", "Computing", "Data Science"],
    links: {
      website: "https://ntuscds.com/",
      club: "https://www.ntu.edu.sg/life-at-ntu/student-life/student-activities-and-engagement/clubs-groups-societies/ntu-students-union-council",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/ntu-scds.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/ntu-scdsc/",
      instagram: "https://www.instagram.com/ntuscdsclub/",
    },
  },

  // Women in Engineering & Mathematical Sciences
  {
    id: "wiems",
    name: "WiEMS",
    full_name: "Women in Engineering & Mathematical Sciences",
    location: "Perth, Australia",
    description:
      "To create an inclusive culture for Women in Engineering and Mathematical Sciences at The University of Western Australia.",
    fullDescription:
      "Women in Engineering and Mathematical Sciences UWA is a newly founded student club dedicated to creating a supportive and inclusive community for female-identifying students studying throughout their university studies. We aim to achieve this mission through a variety of professional industry events and intimate social occasions.",
    category: ["Engineering", "Mathematics", "Science"],
    links: {
      website: "https://www.wiemsuwa.com/",
      club: "https://www.uwastudentguild.com/clubs/women-in-engineering-mathematical-sciences",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/wiems.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/wiemsuwa/",
      instagram: "https://www.instagram.com/wiems_uwa/",
      facebook: "https://www.facebook.com/wiemsuwa",
    },
  },

  // Melbourne University Biomedical Engineering Society
  {
    id: "mubes",
    name: "MUBES",
    full_name: "Melbourne University Biomedical Engineering Society",
    location: "Melbourne, Australia",
    description:
      "A university club that supports Biomedical Engineering students and those interested in the field, through the facilitation of various social and academic events partnered with industry and academia",
    fullDescription:
      "The Melbourne University Biomedical Engineering Society (MUBES) is the official student-led society for biomedical engineering students at the University of Melbourne. Our mission is to empower members with the resources, opportunities, and connections needed to thrive in the dynamic field of biomedical engineering. Through innovative events, we bridge the gap between students and industry leaders, promote professional development, and cultivate an inclusive community in biomedical engineering.",
    category: ["Engineering", "Science", "Biomedical"],
    links: {
      website: "https://www.linkedin.com/company/mubes/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/6245/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/mubes.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/mubes/",
      instagram: "https://www.instagram.com/mubes_unimelb/",
      facebook: "https://www.facebook.com/officialmubespage/",
    },
  },

  // University of Melbourne Competitive Programming Club
  {
    id: "umcpc",
    name: "UMCPC",
    full_name: "University of Melbourne Competitive Programming Club",
    location: "Melbourne, Australia",
    description:
      "The Competitive Programming Club is about doing ridiculously difficult problems within unfairly short time limits.",
    fullDescription:
      "The Competitive Programming Club is about doing ridiculously difficult problems within unfairly short time limits. Our focus is contests such as the ACM ICPC, VCPC, Google Codejam, and Facebook Hacker Cup. We have weekly meetings where we practice problems, discuss algorithms, cry over the parts we didn’t understand, figure things out, and celebrate with free pizza. If you think you’re the next Zuckerberg, this is not the club for you. If you want to be the next Zuckerberg then this is the club for you. Seriously though, succeeding here can greatly increase your prospects for employment.",
    category: ["Tech", "Computing"],
    links: {
      website: "https://umcpc.club/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/6517/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/umcpc.png",
    socials: {
      linkedin:
        "https://www.linkedin.com/company/university-of-melbourne-competitive-programming-club/",
      instagram: "https://www.instagram.com/unimelbcpc/",
      facebook: "https://www.facebook.com/umcpc",
    },
  },

  // RMIT Rover
  {
    id: "rmit_rover",
    name: "RMIT Rover Team",
    full_name: "RMIT Rover Team",
    location: "Melbourne, Australia",
    description:
      "Student team based at RMIT University building a semi-autonomous rover to compete on the national stage and beyond!",
    fullDescription:
      "We at RMIT Rover are an intrepid student team based at RMIT University, Melbourne working on building a semi-autonomous rover to compete on the national stage and beyond. This project brings students from diverse backgrounds and experiences to collaborate – supplementing student’s studies through practical applications in the design and manufacturing of advanced robotics. Through our work, we seek to expand student interest in space technologies and inspire new generations of the workforce towards the burgeoning space industry in our own backyard.",
    category: ["Engineering", "Robotics", "Tech"],
    links: {
      website: "https://rmitroverteam.com/",
      club: "https://www.linkedin.com/company/rmitroverteam/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/rmit-rover.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/rmitroverteam/",
      instagram: "https://www.instagram.com/rmitrover/",
      facebook: "https://www.facebook.com/rmitroverteam",
    },
  },

  // Women in Tech
  {
    id: "wit",
    name: "Women in Tech",
    full_name: "Women in Tech",
    location: "Melbourne, Australia",
    description:
      "We are a community of students from The University of Melbourne with a mission to empower fellow female students studying and interested in all things tech!",
    fullDescription:
      "A student-run organisation at the University of Melbourne. Engaging, inspiring and supporting females pursuing tech-related studies from Undergraduate all the way to PhD. Also involved in some high school outreach. ",
    category: ["Tech"],
    links: {
      website: "https://witunimelb.org.au/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/website/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/wit.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/women-in-tech-wit-unimelb/",
      instagram: "https://www.instagram.com/witunimelb/",
      facebook: "https://www.facebook.com/witunimelb",
    },
  },

  // Business One
  {
    id: "businessone",
    name: "BusinessOne",
    full_name: "BusinessOne",
    location: "Melbourne, Australia",
    description:
      "Empowering the students of today, creating the consultants of tomorrow.",
    fullDescription:
      "BusinessOne Consulting Unimelb is a student run, pro-bono consulting service based in the University of Melbourne. Our focus is on helping startup businesses in any industry on their journey to success. Our consulting services combines classic consulting frameworks with innovative fresh thinking to provide clients with meaningful impact whilst still adapting to the modern entrepreneurship landscape.",
    category: ["Commerce", "Consulting"],
    links: {
      website: "https://www.businessoneunimelb.com/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/8031/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/businessone.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/businessoneunimelb/",
      instagram: "https://www.instagram.com/businessoneunimelb/",
      facebook: "https://www.facebook.com/businessoneunimelb",
    },
  },

  // MTECH
  {
    id: "mtech",
    name: "MTech",
    full_name: "MTech Consulting Club",
    location: "Melbourne, Australia",
    description:
      "Preparing University of Melbourne students to enter IT Consulting industry.",
    fullDescription:
      "Melbourne Technology Consulting Club (MTech) is a club dedicated to all things technology consulting. The club offers members with the opportunities to experience real-life technology consulting projects and to interact with industry professionals and like-minded people. This club is the right choice for you if you want to pursue a career in technology consulting, or want to know more about the field!",
    category: ["Tech", "Consulting", "Commerce"],
    links: {
      website: "https://www.mtechcc.com/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/mtech/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/mtech.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/mtechunimelb/",
      instagram: "https://www.instagram.com/mtech_unimelb/",
    },
  },

  //Women* in Science and Engineering
  {
    id: "wise",
    name: "WISE",
    full_name: "Women* in Science and Engineering",
    location: "Melbourne, Australia",
    description:
      "A student organisation which aims to support female and non-binary students and professionals in STEM.",
    fullDescription:
      "Women* in Science and Engineering (WISE) is a student-run organisation based at the University of Melbourne and proudly affiliated with UMSU. Established in 2010, we've grown to hold a wide range of events to inspire and support female and non-binary students in the STEMM field. Our upskilling workshops, site visits, trivia nights, panels, yearly Networking Night and famed Coffee and Cake events help link the UniMelb WISEdom with our industry connections, providing an inclusive community dedicated to the advancement of professional and determined women in STEMM. With our committee building on the tireless work of previous years, and drawing from a wide range of studies, interests and backgrounds, 2025 is sure to be a great year to be a woman in Science and Engineering.",
    category: ["Science", "Engineering"],
    links: {
      website: "https://wiseunimelb.wixsite.com/wiseunimelb",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7773/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/wise.png",
    socials: {
      linkedin:
        "https://www.linkedin.com/company/women-in-science-and-engineering-wise/",
      facebook: "https://www.facebook.com/wiseunimelb",
      instagram: "https://www.instagram.com/wise_unimelb/",
    },
  },

  // 180 Degrees Consulting Melbourne
  {
    id: "180dc",
    name: "180 Degrees Consulting Melbourne",
    full_name: "180 Degrees Consulting Melbourne",
    location: "Melbourne, Australia",
    description:
      "Our aim is to connect high-achieving and creative students with leading socially-aware organisations.",
    fullDescription:
      "180 Degrees Consulting is the world’s largest non-profit student-driven consultancy. Our mission is to strengthen the ability of socially conscious organizations to achieve high impact social outcomes through the development of innovative, practical and sustainable solutions. Teams of university students completing studies in relevant fields work throughout the year with worthwhile organizations to identify and overcome specific challenges they are facing. This process is mutually beneficial. Organizations are assisted in the development of innovative, sustainable and practical solutions. At the same time, students are able to contribute to their communities, apply their university studies in a practical environment, and develop valuable life skills.",
    category: ["Commerce", "Consulting"],
    links: {
      club: "https://180dc.org/branches/Melbourne",
      website: "https://www.180dcunimelb.org/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/180dc.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/180-degrees-consulting-umelb",
      instagram: "https://www.instagram.com/180dcunimelb/",
      facebook: "https://www.facebook.com/180DegreesMelbourneUniversity/",
    },
  },

  // Robogals Melbourne
  {
    id: "robogals-melb",
    name: "Robogals Melbourne",
    full_name: "Robogals Melbourne",
    location: "Melbourne, Australia",
    description:
      "A student led organisation aimed at inspiring the next generation of young women engineers!",
    fullDescription:
      "Robogals is an international not for profit organisation that aims to inspire, engage and empower young women into engineering and related fields, creating a globally diverse and inclusive culture in engineering. To fulfil this mission, an extensive global network of Robogals volunteers - typically university students - deliver interactive workshops for primary and secondary school students. This approach means that Robogals is in a unique position to empower girls and young women from an early age.",
    category: ["Engineering", "Robotics"],
    links: {
      website:
        "https://robogals.org/locations/asia-pacific-apac/university-of-melbourne/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7453/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/robogals-melb.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/robogalsmelbourne/",
      instagram: "https://www.instagram.com/robogalsmelb/",
      facebook: "https://www.facebook.com/robogalsmelb",
    },
  },

  // Melbourne University Sri Lankan Student Association
  {
    id: "muslsa",
    name: "MUSLSA",
    full_name: "Melbourne University Sri Lankan Student Association",
    location: "Melbourne, Australia",
    description:
      "Join our club to engage in community-oriented events, to meet a range of diverse, new people and to support our charitable causes.",
    fullDescription:
      "The Melbourne University Sri Lankan Students’ Association (MUSLSA) is one of the university’s most popular and active social clubs. We have a broad membership base focussed around students of a Sri Lankan or sub-continental background. MUSLSA prides itself on the quality of the events it organises for its members.",
    category: ["Cultural"],
    links: {
      website:
        "https://www.linkedin.com/company/muslsa-melbourne-university-sri-lankan-students-association/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7549/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/muslsa.png",
    socials: {
      linkedin:
        "https://www.linkedin.com/company/muslsa-melbourne-university-sri-lankan-students-association/",
      instagram: "https://www.instagram.com/muslsa.uom/",
      facebook: "https://www.facebook.com/muslsa.uni",
    },
  },

  // Melbourne University Civil and Structure Society
  {
    id: "mucss",
    name: "Civil and Structural Society",
    full_name: "Melbourne University Civil and Structure Society",
    location: "Melbourne, Australia",
    description: "Everything Civil & Structural Engineering!",
    fullDescription:
      "The Melbourne University Civil & Structural Society (MUCSS) is the official infrastructure faculty-based student-run body for all Civil and Structural Engineering students at The University of Melbourne. MUCSS aims to foster the professional and personal development of both current students and alumni by creating a strong cohort within the Civil and Structural Engineering community. This is achieved via professional networking and industry events, site visits, technical workshops (eg: AutoCAD), study sessions, regular social events such as barbecues, trivia and game nights, and pub nights. MUCSS’ annual flagship events: the Infrastructure Engineering Networking Night and End of Year Cocktail Night, are not to be missed and are a staple in the Faculty of Engineering and IT calendar every year.",
    category: ["Engineering"],
    links: {
      website: "https://www.linkedin.com/company/mucss/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/6461/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/mucss.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/mucss/",
      instagram: "https://www.instagram.com/mucssociety/",
      facebook: "https://www.facebook.com/mucssociety",
    },
  },

  // Progressive Energy Society UWA
  {
    id: "pes",
    name: "Progressive Energy Society",
    full_name: "Progressive Energy Society UWA",
    location: "Perth, Australia",
    description:
      "A student society connecting University of Western Australia's most passionate students to the energy industry.",
    fullDescription:
      "The UWA Progressive Energy Society (PES) aims to encourage and facilitate discussion and networking with respect to the ongoing energy transition and future innovations within the energy sector, by hosting careers and student events across all relevant disciplines of study. Established in 2020, PES is UWA Guild affiliated and UWA's first and only student-led energy society. Join the conversation today.",
    category: ["Science"],
    links: {
      website: "https://www.linkedin.com/company/pesuwa/",
      club: "https://www.uwastudentguild.com/clubs/progressive-energy-strategies",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/pes.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/pesuwa/",
      instagram: "https://www.instagram.com/pes.uwa/",
      facebook: "https://www.facebook.com/progressiveenergysociety/",
    },
  },

  // Quantitative Trading Society
  {
    id: "qts",
    name: "QTS",
    full_name: "Quantitative Trading Society",
    location: "Melbourne, Australia",
    description:
      "A place for students to connect and explore quantitative methods to identify and capitalize on available opportunities",
    fullDescription:
      "A place for like-minded individuals to connect and increase their understanding and proficiency in quantitative trading.",
    category: ["Commerce", "Finance", "Mathematics"],
    links: {
      website: "https://qtsunimelb.com/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7967/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/qts.png",
    socials: {
      linkedin: "https://www.linkedin.com/company/unimelb-qts/",
      instagram: "https://www.instagram.com/qtsunimelb/",
      facebook: "https://www.facebook.com/unimelb.qts/",
    },
  },

  // Drone Aviation and Racing Engineering Society
  {
    id: "dares",
    name: "DARES",
    full_name: "Drone Aviation and Racing Engineering Society",
    location: "Melbourne, Australia",
    description:
      "Our members will have the opportunity to build, design and fly, no matter their degree and experience.",
    fullDescription:
      "DARES is the Drone Aviation and Racing Engineering Society at the University of Melbourne. Our members have the opportunity to build, design and fly drones of all different types and sizes, We hope to allow anyone, regardless of degree and experience to learn about drones and the broader aviation industry. We aim to facilitate this through various social, technical and professional events run throughout the academic year.",
    category: ["Engineering", "Tech", "Robotics"],
    links: {
      website: "https://www.linkedin.com/in/dares-unimelb/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/daresunimelb/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/dares.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/dares-unimelb/",
      instagram: "https://www.instagram.com/daresunimelb/",
    },
  },

  // Hispanic Culture and Language Society
  {
    id: "hcls",
    name: "HCLS",
    full_name: "Hispanic Culture and Language Society",
    location: "Melbourne, Australia",
    description:
      "¡Bienvenidos! those who are learning Spanish, those who are of Hispanic descent, and those who share an interest in Hispanic culture and language ❤️",
    fullDescription:
      "Welcome to the Melbourne University Hispanic Culture and Language Society. Our society celebrates all things related to the Hispanic world. We welcome and are open to everyone, including those who are learning Spanish, those who are of Hispanic descent, and those who share an interest in Hispanic culture and language! Our society is excited to bring you a fun and diverse year of events. ¡Hasta pronto!",
    category: ["Cultural", "Language"],
    links: {
      website: "https://www.instagram.com/muhispanicsociety/",
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/9252/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/hcls.png",
    socials: {
      instagram: "https://www.instagram.com/muhispanicsociety/",
    },
  },

  // Melbourne Sports Business Society
  {
    id: "msbs",
    name: "MSBS",
    full_name: "Melbourne Sports Business Society",
    location: "Melbourne, Australia",
    description:
      "We are a sports business club based at the University of Melbourne oriented at providing students with a world class education around the opportunities in business behind the sports world.",
    fullDescription:
      "We are a sports business club based at the Univeristy of Melbourne oriented at providing students with a world class education around the opportunities in business behind the sports world.",
    category: ["Commerce"],
    links: {
      club: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/msbs/",
    },
    logoUrl:
      "https://nsjrzxbtxsqmsdgevszv.supabase.co/storage/v1/object/public/club_logos/msbs.png",
  },
];
