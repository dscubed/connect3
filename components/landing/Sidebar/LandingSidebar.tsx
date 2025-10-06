import Link from "next/link";
import Logo from "../../Logo";

interface LandingSidebarProps {
  activeSection: string;
  sections: { id: string; label: string }[];
  handleNavClick: (id: string) => void;
}

export default function LandingSidebar({
  activeSection,
  sections = [],
  handleNavClick,
}: LandingSidebarProps) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 w-64 h-screen bg-[#0B0B0C]/95 backdrop-blur-xl border-r border-white/10 shadow-2xl z-30 flex-col justify-between px-8">
      {/* Top section - Logo only */}
      <div className="flex flex-col gap-4 pt-8 md:pt-6">
        <Link
          href="/"
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer"
        >
          <Logo width={20} height={20} fill={"white"} />
          <span className="font-semibold tracking-tight">connect3</span>
        </Link>
      </div>

      {/* Bottom section - Navigation */}
      <div className="pb-8">
        <nav className="flex flex-col gap-1.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer select-none transition-all duration-200 text-left ${
                activeSection === section.id
                  ? "bg-white/10 text-white shadow-lg shadow-white/5"
                  : "text-white/80 hover:bg-white/5 hover:text-white hover:scale-105"
              }`}
            >
              <span className="text-sm">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
