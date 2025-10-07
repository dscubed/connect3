import SidebarButton from "@/components/sidebar/SidebarButton";
import SidebarHeader from "@/components/sidebar/SidebarHeader";

interface LandingSidebarProps {
  activeSection: string;
  sections: { id: string; label: string }[];
  handleNavClick: (id: string) => void;
  sectionClicked?: string | null;
}

export default function LandingSidebar({
  activeSection,
  sections = [],
  handleNavClick,
  sectionClicked,
}: LandingSidebarProps) {
  activeSection = sectionClicked || activeSection;
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 w-64 h-screen bg-[#0B0B0C]/95 backdrop-blur-xl border-r border-white/10 shadow-2xl z-30 flex-col justify-between px-8">
      {/* Top section - Logo only */}
      <div className="flex flex-col gap-4 pt-8 md:pt-6">
        <SidebarHeader />
      </div>

      {/* Bottom section - Navigation */}
      <div className="pb-8">
        <nav className="flex flex-col gap-1.5">
          {sections.map((section) => (
            <div onClick={() => handleNavClick(section.id)} key={section.id}>
              <SidebarButton
                label={section.label}
                active={activeSection === section.id}
              />
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
