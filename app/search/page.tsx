"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Share, Search } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { CubeLoader } from "@/components/ui/CubeLoader";
import { ProfileCard } from "@/components/search/ProfileCard";
import { UserProfile } from "@/components/search/UserProfile";

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
    today: ["building educational content for web3 newcomers", "developing smart contracts and dApps"],
    pastVentures: ["launched 3 successful NFT collections", "built a DeFi protocol with $2M+ TVL"],
    viralSuccess: ["web3 tutorial series reached 500k+ views", "smart contract audit tool gained 50k+ users"],
    lookingFor: ["seeking technical co-founders and blockchain developers"],
  },
]

const SEARCH_RESULTS = {
  result: "got a couple of folks who might be perfect for you.",
  matches: [
    {
      user: "tushar",
      description: "first up is tushar, a young entrepreneur and content creator from india. he's making waves in the web3 space with his engaging and fun videos. he's looking for a creative video editor and open to collaborations."
    },
    {
      user: "rahul",
      description: "then there's rahul, a passionate web3 enthusiast and developer based in mumbai, india. he's creating tutorials and short videos to introduce web3 to newcomers. he's also open to collaborations and new opportunities."
    }
  ],
  followUps: "what kind of content are you looking to create?"
};

export default function SearchResults() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<(typeof USER_PROFILES)[0] | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [newQuery, setNewQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleUserClick = (user: (typeof USER_PROFILES)[0]) => {
    setSelectedUser(user)
    setProfileOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div
          className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl opacity-30"
          style={{
            background: "radial-gradient(60% 60% at 50% 50%, #7C3AED55 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-16 h-56 w-56 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(60% 60% at 50% 50%, #06B6D455 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-16 h-48 w-48 rounded-full blur-3xl opacity-15"
          style={{
            background: "radial-gradient(60% 60% at 50% 50%, #10B98155 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>


      <div className="grid max-w-7xl grid-cols-12 gap-6 px-4 py-6 md:px-8 relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <main className="col-span-12 md:col-span-9 lg:col-span-10 pt-16 md:pt-0 relative">
          <motion.div
            className="flex justify-end mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/30 border border-white/10 hover:bg-black/40 transition-all"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Share className="h-4 w-4" />
              <span className="text-sm">share search</span>
            </motion.button>
          </motion.div>

          <div className="max-w-4xl space-y-8">
            <motion.div
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-block">
                <div className="text-white/60 text-sm mb-1">you</div>
                <div className="text-white text-lg">looking for web3 content creators</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-white/60 text-sm mb-2">c3</div>

              {isLoading ? (
                <div className="space-y-4">
                  <p className="text-white/80">searching for the perfect matches...</p>
                  <CubeLoader size={48} />
                </div>
              ) : (
                <motion.div
                  className="space-y-4 text-white/80 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {SEARCH_RESULTS.result}
                  </motion.p>

                  {SEARCH_RESULTS.matches.map((match, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
                    >
                      {match.description}
                    </motion.p>
                  ))}

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    {SEARCH_RESULTS.followUps}
                  </motion.p>
                </motion.div>
              )}
            </motion.div>

            {!isLoading && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8"
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
        </main>
      </div>

      <motion.div
        className="mt-12 pt-8 border-t border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur"
            whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
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
                  // Handle new search
                  setNewQuery("")
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
                  // Handle new search
                  setNewQuery("")
                }
              }}
            >
              Search
            </motion.button>
          </motion.div>

          <motion.p
            className="text-center text-white/50 text-sm mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Try: "Who else builds with AI?" or "Find designers in crypto"
          </motion.p>
        </div>
      </motion.div>

      <UserProfile 
        user={selectedUser} 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />
    </div>
  )
}
