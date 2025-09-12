"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { ProfileCard } from "@/components/search/ProfileCard";
import { UserProfile } from "@/components/search/UserProfile";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

const USER_PROFILES = [
  {
    id: "tushar",
    name: "tushar",
    description: "engaging and fun web3 videos",
    avatar: "https://i.pravatar.cc/120?img=20",
    location: "asia, india",
    tldr: "tushar is a young entrepreneur and content creator from india, making waves in the web3 space with his engaging and fun videos.",
    today: [
      "creating fun web3 videos, focusing on making the space engaging and accessible",
      "looking for a creative video editor to join him remotely",
    ],
    pastVentures: [
      "started his first business selling movies at age 11",
      "by 17, was generating over $10,00,000 monthly revenue from 10+ ventures",
    ],
    viralSuccess: [
      "tweet about buying an iphone on emi hit over 10 million views",
      "helped a gaming project attract 100,000+ users",
    ],
    lookingFor: ["seeking video editors, collaborators, and investors"],
  },
  {
    id: "rahul",
    name: "rahul",
    description: "passionate web3 tutorials and short videos",
    avatar: "https://i.pravatar.cc/120?img=21",
    location: "mumbai, india",
    tldr: "rahul is a passionate web3 enthusiast and developer based in mumbai, creating tutorials and short videos to introduce web3 to newcomers.",
    today: [
      "building educational content for web3 newcomers",
      "developing smart contracts and dApps",
    ],
    pastVentures: [
      "launched 3 successful NFT collections",
      "built a DeFi protocol with $2M+ TVL",
    ],
    viralSuccess: [
      "web3 tutorial series reached 500k+ views",
      "smart contract audit tool gained 50k+ users",
    ],
    lookingFor: ["seeking technical co-founders and blockchain developers"],
  },
];

interface SearchResults {
  result: string;
  matches: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
    files: { file_id: string; description: string }[];
  }[];
  followUps: string;
}

export default function SearchResults() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<
    (typeof USER_PROFILES)[0] | null
  >(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newQuery, setNewQuery] = useState("");
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );

  const handleUserClick = (user: (typeof USER_PROFILES)[0]) => {
    setSelectedUser(user);
    setProfileOpen(true);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query) {
        setIsLoading(true);

        try {
          const res = await fetch("/api/vector-store/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
          const data = await res.json();
          console.log("Search results:", data);

          if (data.success) {
            setSearchResults({
              result: data.result,
              matches: data.matches,
              followUps: data.followUps,
            });
          } else {
            setSearchResults(null);
          }
          setIsLoading(false);
        } catch (err) {
          console.error("Search error:", err);
          setIsLoading(false);
        }
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <main className="flex-1 pt-16 md:pt-0 relative flex flex-col h-screen">
          {/* Share button */}
          <motion.div
            className="flex justify-end p-4 flex-shrink-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/30 border border-white/10 hover:bg-black/40 transition-all"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(255,255,255,0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Share className="h-4 w-4" />
              <span className="text-sm">share search</span>
            </motion.button>
          </motion.div>
          {/* Scrollable content area */}
          <div
            className="flex-1 overflow-y-auto pr-4 pb-30"
            style={{
              maxHeight: "calc(100vh)",
              paddingBottom: "140px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            {/* Query Section */}
            <motion.div
              className="text-right max-w-4xl mx-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-block">
                <div className="text-white/60 text-sm mb-1">you</div>
                <div className="text-white text-lg">{query}</div>
              </div>
            </motion.div>

            {/* Search Results */}
            <motion.div
              className="max-w-4xl mx-auto space-y-8 mt-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-white/60 text-sm mb-2">c3</div>
              {/* Loading State */}
              {isLoading ? (
                <div className="space-y-4">
                  <p className="text-white/80">
                    searching for the perfect matches...
                  </p>
                  <div className="flex justify-center py-8">
                    <CubeLoader size={48} />
                  </div>
                </div>
              ) : (
                // Results
                <motion.div
                  className="space-y-6 text-white/80 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {searchResults?.result}
                  </motion.p>

                  {(searchResults?.matches || []).map((match, userIndex) => (
                    <motion.div
                      key={`user-${userIndex}`}
                      className="space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.4 + userIndex * 0.2,
                      }}
                    >
                      {/* User header with avatar and name */}
                      <div className="flex items-center gap-3 mb-2">
                        {match?.avatar_url ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                            <Image
                              src={match.avatar_url}
                              alt={`${match.full_name || "User"}'s avatar`}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {match?.full_name?.[0] || "U"}
                          </div>
                        )}
                        <span className="text-white font-medium text-lg">
                          {match.full_name || "User"}
                        </span>
                      </div>

                      {/* File descriptions */}
                      {match.files.map((file, fileIndex) => (
                        <motion.p
                          key={file.file_id}
                          className="pl-11" // Changed from pl-2 to align with user name
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.6 + userIndex * 0.2 + fileIndex * 0.1,
                          }}
                        >
                          {file.description}
                        </motion.p>
                      ))}
                    </motion.div>
                  ))}

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    {searchResults?.followUps}
                  </motion.p>
                </motion.div>
              )}
            </motion.div>

            {/* User Profile Cards */}
            {!isLoading && (
              <motion.div
                className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {USER_PROFILES.map((person, index) => (
                  <ProfileCard
                    key={person.id}
                    person={person}
                    index={index}
                    onClick={() => handleUserClick(person)}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Fixed search bar at bottom */}
          {!isLoading && (
            <motion.div
              className="absolute bottom-4 left-0 right-0 z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="max-w-2xl mx-auto relative">
                <motion.div
                  className="relative flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-4 py-3 backdrop-blur-xl shadow-2xl"
                  whileHover={{
                    borderColor: "rgba(255,255,255,0.3)",
                    scale: 1.01,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="h-5 w-5 text-white/60" />
                  <input
                    className="w-full bg-transparent outline-none placeholder:text-white/40 text-white"
                    placeholder="Ask another question or refine your search..."
                    value={newQuery}
                    onChange={(e) => setNewQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newQuery.trim()) {
                        setNewQuery("");
                      }
                    }}
                  />
                  <motion.button
                    className="rounded-xl px-3 py-1.5 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newQuery.trim()}
                    whileHover={newQuery.trim() ? { scale: 1.05 } : {}}
                    whileTap={newQuery.trim() ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (newQuery.trim()) {
                        setNewQuery("");
                      }
                    }}
                  >
                    Search
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      <UserProfile
        user={selectedUser}
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
