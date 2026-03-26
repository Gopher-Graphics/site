// Vista Aero Glass design tokens — UMN Maroon / Gold / White
export const G = {
  // Primary glass panel — main cards, modals, nav
  glass: {
    background: "linear-gradient(168deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 40%, rgba(255,204,51,0.06) 100%)",
    backdropFilter: "blur(24px) saturate(1.9) brightness(1.05)",
    WebkitBackdropFilter: "blur(24px) saturate(1.9) brightness(1.05)",
    border: "1.5px solid rgba(255,255,255,0.5)",
    boxShadow:
      "0 8px 40px rgba(80,0,15,0.28)," +
      "0 1.5px 0 rgba(255,255,255,0.7) inset," +
      "0 -1px 0 rgba(255,204,51,0.15) inset," +
      "0 0 0 0.5px rgba(255,255,255,0.15)",
    borderRadius: "18px",
    position: "relative",
    overflow: "hidden",
  },

  // Lighter glass for interactive cards
  glassCard: {
    background: "linear-gradient(170deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 50%, rgba(122,0,25,0.08) 100%)",
    backdropFilter: "blur(20px) saturate(1.8)",
    WebkitBackdropFilter: "blur(20px) saturate(1.8)",
    border: "1.5px solid rgba(255,255,255,0.45)",
    boxShadow:
      "0 6px 32px rgba(80,0,15,0.22)," +
      "0 1.5px 0 rgba(255,255,255,0.65) inset," +
      "0 -1px 0 rgba(255,204,51,0.1) inset",
    borderRadius: "16px",
    position: "relative",
    overflow: "hidden",
  },

  // Dark glass for sidebars, overlay areas
  glassDark: {
    background: "linear-gradient(180deg, rgba(40,0,10,0.55) 0%, rgba(20,0,5,0.65) 100%)",
    backdropFilter: "blur(28px) saturate(1.6)",
    WebkitBackdropFilter: "blur(28px) saturate(1.6)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow:
      "0 8px 32px rgba(0,0,0,0.35)," +
      "0 1px 0 rgba(255,255,255,0.2) inset",
    borderRadius: "16px",
  },

  // Vista-style reflective button
  btn: {
    background:
      "linear-gradient(180deg," +
      "rgba(255,255,255,0.92) 0%," +
      "rgba(255,240,200,0.78) 46%," +
      "rgba(210,155,40,0.82) 50%," +
      "rgba(255,235,160,0.68) 51%," +
      "rgba(255,245,200,0.55) 100%)",
    backdropFilter: "blur(8px)",
    border: "1.5px solid rgba(255,255,255,0.85)",
    boxShadow:
      "0 2px 12px rgba(122,0,25,0.2)," +
      "0 1px 0 rgba(255,255,255,0.95) inset," +
      "0 -0.5px 0 rgba(200,160,60,0.4) inset",
    borderRadius: "22px",
    cursor: "pointer",
    fontFamily: "'Segoe UI','Trebuchet MS',system-ui,sans-serif",
    fontWeight: "600",
    letterSpacing: "0.03em",
    transition: "all 0.18s ease",
  },

  // Accent colors
  gold: "#FFCC33",
  goldLight: "#FFE488",
  maroon: "#7A0019",
  maroonDeep: "#4A000F",
  white: "#FFFDF7",

  // Font stack
  ff: "'Segoe UI','Trebuchet MS',system-ui,sans-serif",

  // Reusable Vista shine bar (place as ::before pseudo or a child div)
  shine: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 50%, transparent 50.5%)",

  // Gold reflection strip
  reflection: "linear-gradient(180deg, transparent 48%, rgba(255,204,51,0.08) 49%, rgba(255,204,51,0.04) 100%)",

  // Glow for active/focused elements
  glowGold: "0 0 20px rgba(255,204,51,0.3), 0 0 60px rgba(255,204,51,0.1)",
  glowMaroon: "0 0 20px rgba(122,0,25,0.4), 0 0 60px rgba(122,0,25,0.15)",
};
