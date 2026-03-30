import React from "react";

export function AboutPage() {
  const MEMBERS = [
    { name:"Mia Chen",  role:"President"      },
    { name:"Jonas K.",  role:"Vice President" },
    { name:"Priya S.",  role:"Projects Lead"  },
    { name:"Liam D.",   role:"Webmaster"      },
    { name:"Sara V.",   role:"Events"         },
    { name:"Dev M.",    role:"Member"         },
  ];

  const infoCards = [
    { icon:"CAL", title:"Weekly Meetings", info:"Every Thursday, 6:00 PM", sub:"Keller Hall 3-125" },
    { icon:"MSG", title:"Discord",         info:"discord.gg/gopherGFX",    sub:"Always active — ask questions anytime" },
  ];

  return (
    <div className="min-h-screen max-w-[1000px] mx-auto px-[clamp(16px,4vw,32px)] pt-[clamp(32px,5vw,48px)] pb-16 animate-[fadeUp_.6s_ease_both]">

      <h1 className="font-ui font-bold text-white m-0 mb-1" style={{ fontSize:"clamp(26px,4vw,48px)", textShadow:"0 2px 24px rgba(255,204,51,.4)" }}>About Us</h1>
      <div className="w-[60px] h-[3px] mb-2.5 rounded-sm" style={{ background:"linear-gradient(90deg,#FFCC33,transparent)" }} />
      <p className="font-ui mb-9 text-[15px]" style={{ color:"rgba(255,225,195,.6)" }}>Minnesota's home for computer graphics enthusiasts</p>

      {/* Mission */}
      <div className="glass mb-7" style={{ padding:"clamp(22px,4vw,36px)", backgroundImage:"linear-gradient(135deg, rgba(122,0,25,.2), rgba(180,100,0,.08))" }}>
        <div className="shine-bar" />
        <h2 className="font-ui text-gold text-[22px] mb-3.5 relative">Our Mission</h2>
        <p className="font-ui text-[15px] leading-[1.75] m-0 relative" style={{ color:"rgba(255,230,210,.84)" }}>
          Gopher Graphics is a student-run club at the University of Minnesota dedicated to exploring all facets of computer graphics — from real-time rendering and GPU programming to physically-based simulation, digital art, and interactive media. We welcome everyone from curious beginners to seasoned demoscene veterans.
        </p>
      </div>

      {/* Info cards */}
      <div className="grid gap-5 mb-7" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))" }}>
        {infoCards.map((item, i) => (
          <div key={i} className="glass-card p-[clamp(22px,4vw,28px)] transition-[transform,box-shadow] duration-200"
            onMouseOver={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 6px 32px rgba(80,0,15,0.22),0 1.5px 0 rgba(255,255,255,0.65) inset,0 0 20px rgba(255,204,51,0.3)"; }}
            onMouseOut ={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
            <div className="shine-bar" />
            <div className="icon-badge mb-2.5 relative">{item.icon}</div>
            <h3 className="font-ui text-white font-bold text-base mb-1.5 relative">{item.title}</h3>
            <p className="font-ui font-semibold text-[15px] mb-1 relative" style={{ color:"rgba(255,235,195,.88)" }}>{item.info}</p>
            <p className="font-ui text-[12px] m-0 relative" style={{ color:"rgba(255,215,170,.5)" }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Members */}
      <div className="glass mb-7 p-[clamp(22px,4vw,30px)]">
        <div className="shine-bar" />
        <h2 className="font-ui text-gold text-xl mb-[22px] relative">Officers &amp; Members</h2>
        <div className="grid gap-3.5 relative" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))" }}>
          {MEMBERS.map((m, i) => (
            <div key={i}
              className="rounded-[14px] py-[18px] px-3.5 text-center transition-all duration-200 cursor-default"
              style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,204,51,.15)" }}
              onMouseOver={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.background="rgba(255,204,51,.1)"; e.currentTarget.style.borderColor="rgba(255,204,51,.4)"; e.currentTarget.style.boxShadow="0 0 20px rgba(255,204,51,0.3)"; }}
              onMouseOut ={e => { e.currentTarget.style.transform=""; e.currentTarget.style.background="rgba(255,255,255,.06)"; e.currentTarget.style.borderColor="rgba(255,204,51,.15)"; e.currentTarget.style.boxShadow="none"; }}>
              <div className="w-[42px] h-[42px] rounded-full mx-auto mb-2 flex items-center justify-center font-ui font-bold text-sm text-gold"
                style={{ background:"rgba(122,0,25,.45)", border:"1.5px solid rgba(255,204,51,.3)" }}>
                {m.name.split(" ").map(w => w[0]).join("")}
              </div>
              <div className="font-ui text-white text-[13px] font-bold">{m.name}</div>
              <div className="font-ui text-[11px] mt-0.5" style={{ color:"rgba(255,204,51,.65)" }}>{m.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
