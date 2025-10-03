"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Mail,
  MapPin,
  Users,
  Target,
  Calendar,
  Globe,
  Sparkles,
  Building2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface ClubData {
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

const clubsData: ClubData[] = [
  {
    id: "hackmelbourne",
    name: "HackMelbourne",
    tagline: "Innovation through code and community",
    description: "Student-run club dedicated to making tech accessible to everyone.",
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
      website: "https://umsu.unimelb.edu.au/buddy-up/clubs/clubs-listing/join/7902/",
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
      address: "School of Computing and Information Systems, University of Melbourne",
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

function ClubListCard({ club, isSelected, onClick }: { 
  club: ClubData; 
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border transition-all duration-200 ${
        isSelected
          ? "bg-white/10 border-white/30 shadow-lg"
          : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
      }`}
    >
      <div className="p-4 flex items-start gap-4">
        {/* Logo */}
        <div className={`${club.color} rounded-lg p-3 flex-shrink-0 border border-white/20`}>
          <div className="w-12 h-12 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg mb-1 truncate">
            {club.name}
          </h3>
          <p className="text-white/60 text-sm mb-2 line-clamp-2">
            {club.tagline}
          </p>
          <div className="flex flex-wrap gap-2">
            {club.focus.slice(0, 2).map((area, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-md text-xs bg-white/10 text-white/80 border border-white/20"
              >
                {area}
              </span>
            ))}
            {club.focus.length > 2 && (
              <span className="px-2 py-1 rounded-md text-xs bg-white/10 text-white/80 border border-white/20">
                +{club.focus.length - 2} more
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ClubDetailPanel({ club }: { club: ClubData }) {
  return (
    <motion.div
      key={club.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto scrollbar-hide"
    >
      {/* Header with Logo */}
      <div className={`relative rounded-2xl bg-gradient-to-br ${club.bgGradient} p-8 mb-6 border border-white/20`}>
        <div className="flex items-start gap-6">
          <div className={`${club.color} rounded-2xl p-4 flex-shrink-0 border-2 border-white/30`}>
            <div className="w-20 h-20 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{club.name}</h1>
            <p className="text-xl text-white/80 italic mb-4">{club.tagline}</p>
            {club.established && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30">
                <Calendar className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-medium">
                  Est. {club.established}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">About</h2>
        <p className="text-white/80 leading-relaxed">{club.fullDescription}</p>
      </div>

      {/* Focus Areas */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-white/60" />
          <h2 className="text-xl font-bold text-white">Focus Areas</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {club.focus.map((area, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white border border-white/20"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-white/60" />
          <h2 className="text-xl font-bold text-white">What We Do</h2>
        </div>
        <ul className="space-y-3">
          {club.activities.map((activity, idx) => (
            <li key={idx} className="flex items-start gap-3 text-white/80">
              <span className="text-white/40 mt-1 flex-shrink-0">•</span>
              <span>{activity}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Goals */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-white/60" />
          <h2 className="text-xl font-bold text-white">Our Goals</h2>
        </div>
        <ul className="space-y-3">
          {club.goals.map((goal, idx) => (
            <li key={idx} className="flex items-start gap-3 text-white/80">
              <span className="text-white/40 mt-1 flex-shrink-0">→</span>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Leadership */}
      {club.leadership && (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-white/60" />
            <h2 className="text-xl font-bold text-white">Leadership Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {club.leadership.president && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">President</p>
                <p className="text-white font-medium">{club.leadership.president}</p>
              </div>
            )}
            {club.leadership.secretary && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">Secretary</p>
                <p className="text-white font-medium">{club.leadership.secretary}</p>
              </div>
            )}
            {club.leadership.treasurer && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">Treasurer</p>
                <p className="text-white font-medium">{club.leadership.treasurer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Get In Touch</h2>
        <div className="space-y-4">
          {club.contact.email && (
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-white/60 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">Email</p>
                <a
                  href={`mailto:${club.contact.email}`}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {club.contact.email}
                </a>
              </div>
            </div>
          )}
          {club.contact.address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-white/60 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">Location</p>
                <p className="text-white/80">{club.contact.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-white/60" />
          <h2 className="text-xl font-bold text-white">Links</h2>
        </div>
        <div className="space-y-3">
          {club.links.website && (
            <a
              href={club.links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-white/60" />
                <span className="text-white font-medium">Official Website</span>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
            </a>
          )}
          {club.links.umsu && (
            <a
              href={club.links.umsu}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-white/60" />
                <span className="text-white font-medium">UMSU Club Page</span>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ClubsPage() {
  const [selectedClub, setSelectedClub] = useState<ClubData>(clubsData[0]);

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Club List */}
        <div className="w-full md:w-96 lg:w-[450px] border-r border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b border-white/10 p-6 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Clubs</h1>
            </div>
            <p className="text-white/60 text-sm">
              {clubsData.length} clubs at University of Melbourne
            </p>
          </div>

          {/* Club List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {clubsData.map((club) => (
              <ClubListCard
                key={club.id}
                club={club}
                isSelected={selectedClub.id === club.id}
                onClick={() => setSelectedClub(club)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Club Details */}
        <div className="flex-1 bg-black overflow-hidden">
          <div className="h-full overflow-y-auto p-6 lg:p-8 scrollbar-hide">
            <AnimatePresence mode="wait">
              <ClubDetailPanel club={selectedClub} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
