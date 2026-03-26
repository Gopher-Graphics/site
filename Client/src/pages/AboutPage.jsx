import React from "react";
import { G } from "../constants/theme";

export function AboutPage() {
  const MEMBERS = [
    { name:"Mia Chen", role:"President", emoji:"👩‍💻" },
    { name:"Jonas K.", role:"Vice President", emoji:"👨‍🎨" },
    { name:"Priya S.", role:"Projects Lead", emoji:"👩‍🔬" },
    { name:"Liam D.", role:"Webmaster", emoji:"🧑‍💻" },
    { name:"Sara V.", role:"Events", emoji:"👩‍🏫" },
    { name:"Dev M.", role:"Member", emoji:"👨‍💼" },
  ];
  return (
    <div style={{ minHeight:"100vh", padding:"clamp(32px,5vw,48px) clamp(16px,4vw,32px) 60px", maxWidth:1000, margin:"0 auto" }}>
      <div style={{ animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontFamily:G.ff, color:"#fff", fontSize:"clamp(26px,4vw,48px)", fontWeight:700, margin:"0 0 4px", textShadow:"0 2px 24px rgba(255,204,51,.4)" }}>About Us</h1>
        <div style={{ width:60, height:3, background:"linear-gradient(90deg,#FFCC33,transparent)", borderRadius:2, marginBottom:10 }} />
        <p style={{ fontFamily:G.ff, color:"rgba(255,225,195,.6)", marginBottom:36, fontSize:15 }}>Minnesota's home for computer graphics enthusiasts</p>

        {/* Mission */}
        <div style={{ ...G.glass, padding:"clamp(22px,4vw,36px)", marginBottom:28, backgroundImage:"linear-gradient(135deg, rgba(122,0,25,.2), rgba(180,100,0,.08))" }}>
          <div className="shine-bar" />
          <h2 style={{ fontFamily:G.ff, color:G.gold, margin:"0 0 14px", fontSize:22, position:"relative" }}>🌟 Our Mission</h2>
          <p style={{ fontFamily:G.ff, color:"rgba(255,230,210,.84)", fontSize:15, lineHeight:1.75, margin:0, position:"relative" }}>Gopher Graphics is a student-run club at the University of Minnesota dedicated to exploring all facets of computer graphics — from real-time rendering and GPU programming to physically-based simulation, digital art, and interactive media. We welcome everyone from curious beginners to seasoned demoscene veterans.</p>
        </div>

        {/* Info cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20, marginBottom:28 }}>
          {[
            { icon:"📅", title:"Weekly Meetings", info:"Every Thursday, 6:00 PM", sub:"Keller Hall 3-125" },
            { icon:"💬", title:"Discord", info:"discord.gg/gopherGFX", sub:"Always active — ask questions anytime" },
          ].map((item,i) => (
            <div key={i} style={{
              ...G.glassCard, padding:"24px 26px",
              transition:"transform .2s ease, box-shadow .2s ease",
            }}
              onMouseOver={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`${G.glassCard.boxShadow},${G.glowGold}`}}
              onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=G.glassCard.boxShadow}}
            >
              <div className="shine-bar" />
              <div style={{ fontSize:28, marginBottom:10, position:"relative" }}>{item.icon}</div>
              <h3 style={{ fontFamily:G.ff, color:"#fff", margin:"0 0 6px", fontSize:16, position:"relative" }}>{item.title}</h3>
              <p style={{ fontFamily:G.ff, color:"rgba(255,235,195,.88)", margin:"0 0 4px", fontSize:15, fontWeight:600, position:"relative" }}>{item.info}</p>
              <p style={{ fontFamily:G.ff, color:"rgba(255,215,170,.5)", margin:0, fontSize:12, position:"relative" }}>{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Members */}
        <div style={{ ...G.glass, padding:"clamp(22px,4vw,30px)", marginBottom:28 }}>
          <div className="shine-bar" />
          <h2 style={{ fontFamily:G.ff, color:G.gold, margin:"0 0 22px", fontSize:20, position:"relative" }}>👥 Officers & Members</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:14, position:"relative" }}>
            {MEMBERS.map((m,i) => (
              <div key={i} style={{
                background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,204,51,.15)",
                borderRadius:14, padding:"18px 14px", textAlign:"center",
                transition:"all .2s ease", cursor:"default",
              }}
                onMouseOver={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.background="rgba(255,204,51,.1)";e.currentTarget.style.borderColor="rgba(255,204,51,.4)";e.currentTarget.style.boxShadow=G.glowGold}}
                onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.borderColor="rgba(255,204,51,.15)";e.currentTarget.style.boxShadow="none"}}
              >
                <div style={{ fontSize:30, marginBottom:8 }}>{m.emoji}</div>
                <div style={{ fontFamily:G.ff, color:"#fff", fontSize:13, fontWeight:700 }}>{m.name}</div>
                <div style={{ fontFamily:G.ff, color:"rgba(255,204,51,.65)", fontSize:11, marginTop:3 }}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
