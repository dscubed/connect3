export const LandingHeroGlow = () => {
  return (
    <div className="w-full relative pb-6">
      {/* Main gradient line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/80 to-white/40" />

      {/* Glow effects - positioned to emanate from the line */}
      <div className="absolute top-1/4 -translate-y-1/2 left-0 right-0 h-1 xs:h-2 sm:h-3 bg-gradient-to-r from-white/5 via-white/3 to-white/5 blur-md" />
      <div className="absolute top-1/4 -translate-y-1/2 left-0 right-0 h-2 xs:h-4 sm:h-6 bg-gradient-to-r from-white/5 via-white/20 to-white/5 blur-md" />
      <div className="absolute top-1/4 -translate-y-1/2 left-0 right-0 h-3 xs:h-6 sm:h-8 bg-gradient-to-r from-white/5 via-white/15 to-white/5 blur-md" />
      <div className="absolute top-1/4 -translate-y-1/2 left-0 right-0 h-4 xs:h-8 sm:h-10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-md" />
    </div>
  );
};
