import React from "react";

export function HomeHeroBackground() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top right, #864EFF 30%, #BCEAF3 100%)",
          opacity: 0.4,
        }}
      />
      <div className="home-hero-noise absolute inset-0" />
    </div>
  );
}
