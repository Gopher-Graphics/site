import React from "react";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();

  const cards = [
    { icon:"WS",  title:"Weekly Workshops",     desc:"Learn shaders, rendering algorithms, and graphics APIs together." },
    { icon:"GFX", title:"Project Showcases",     desc:"Present your work and get feedback from fellow Gophers." },
    { icon:"CUP", title:"Competitions",          desc:"Join demoscene competitions and game jams as a team." },
    { icon:"NET", title:"Industry Connections",  desc:"Network with alumni at studios and tech companies." },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 pt-[clamp(40px,8vw,80px)] pb-16">
      {/* Hero */}
      <div className="text-center max-w-[720px] animate-[fadeUp_.7s_ease_both] relative">
        {/* Glow backdrop */}
        <div className="absolute -inset-10 rounded-[28px] pointer-events-none"
          style={{ background:"radial-gradient(ellipse at 50% 40%, rgba(122,0,25,0.18), rgba(255,204,51,0.05), transparent 70%)", filter:"blur(30px)" }} />

        <h1 className="font-ui font-bold text-white relative mb-2.5"
          style={{ fontSize:"clamp(34px,6vw,72px)", letterSpacing:"-0.02em", lineHeight:1.08, textShadow:"0 2px 40px rgba(255,204,51,.45), 0 0 100px rgba(122,0,25,.4)" }}>
          Gopher Graphics
        </h1>
        <div className="w-20 h-[3px] mx-auto mb-[18px] rounded-sm"
          style={{ background:"linear-gradient(90deg,transparent,#FFCC33,transparent)" }} />
        <p className="font-ui mb-9 relative"
          style={{ fontSize:"clamp(15px,2vw,18px)", color:"rgba(255,235,210,.85)", lineHeight:1.65, textShadow:"0 1px 8px rgba(122,0,25,.3)" }}>
          The Computer Graphics Club at the University of Minnesota.
        </p>

        <div className="flex gap-3.5 justify-center flex-wrap relative">
          <button onClick={() => navigate("/projects")}
            className="btn-vista px-8 py-3.5 text-[#3a0008]"
            style={{ fontSize:"clamp(14px,1.8vw,16px)" }}>
            View Projects →
          </button>
          <button onClick={() => navigate("/about")}
            className="btn-ghost px-8 py-3.5"
            style={{ fontSize:"clamp(14px,1.8vw,16px)" }}>
            About Us
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-[18px] w-full mt-[72px] px-1 animate-[fadeUp_.85s_ease_.15s_both]"
        style={{ gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", maxWidth:860 }}>
        {cards.map((f, i) => (
          <div key={i} className="glass-card p-6 transition-[transform,box-shadow] duration-[220ms] ease-out cursor-default"
            onMouseOver={e => { e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow="0 6px 32px rgba(80,0,15,0.22),0 1.5px 0 rgba(255,255,255,0.65) inset,0 -1px 0 rgba(255,204,51,0.1) inset,0 0 20px rgba(255,204,51,0.3)"; }}
            onMouseOut={e  => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
            <div className="shine-bar" />
            <div className="icon-badge mb-2.5 relative">{f.icon}</div>
            <h3 className="font-ui text-white font-bold text-[15px] mb-2 relative">{f.title}</h3>
            <p className="font-ui text-[13px] m-0 leading-[1.55] relative" style={{ color:"rgba(255,225,195,.7)" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
