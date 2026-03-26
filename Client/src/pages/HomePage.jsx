import React from "react";
import { useNavigate } from "react-router-dom";
import { G } from "../constants/theme";

export function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"clamp(40px,8vw,80px) 20px 60px" }}>
      {/* Hero */}
      <div style={{
        textAlign:"center", maxWidth:720, animation:"fadeUp .7s ease both",
        position:"relative",
      }}>
        {/* Frosted hero card */}
        <div style={{
          position:"absolute", inset:"-40px -50px", borderRadius:28,
          background:"radial-gradient(ellipse at 50% 40%, rgba(122,0,25,0.18), rgba(255,204,51,0.05), transparent 70%)",
          filter:"blur(30px)", pointerEvents:"none",
        }} />

        <h1 style={{
          fontFamily:G.ff, fontSize:"clamp(34px,6vw,72px)", fontWeight:700,
          margin:"0 0 10px", color:"#fff", position:"relative",
          textShadow:"0 2px 40px rgba(255,204,51,.45), 0 0 100px rgba(122,0,25,.4)",
          letterSpacing:"-0.02em", lineHeight:1.08,
        }}>
          Gopher Graphics
        </h1>
        <div style={{ width:80, height:3, margin:"0 auto 18px", background:"linear-gradient(90deg,transparent,#FFCC33,transparent)", borderRadius:2 }} />
        <p style={{
          fontFamily:G.ff, fontSize:"clamp(15px,2vw,18px)", color:"rgba(255,235,210,.85)",
          marginBottom:36, lineHeight:1.65, textShadow:"0 1px 8px rgba(122,0,25,.3)",
          position:"relative",
        }}>
          The Computer Graphics Club at the University of Minnesota.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", position:"relative" }}>
          <button
            onClick={()=>navigate("/projects")}
            style={{
              ...G.btn, padding:"14px 34px", fontSize:"clamp(14px,1.8vw,16px)", color:"#3a0008",
              background:"linear-gradient(180deg,rgba(255,255,255,.95) 0%,rgba(255,240,180,.82) 46%,rgba(210,155,40,.88) 50%,rgba(255,235,160,.72) 51%,rgba(255,245,200,.6) 100%)",
            }}
            onMouseOver={e=>{e.currentTarget.style.transform="translateY(-3px) scale(1.02)";e.currentTarget.style.boxShadow=`${G.btn.boxShadow},${G.glowGold}`}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=G.btn.boxShadow}}
          >View Projects →</button>
          <button
            onClick={()=>navigate("/about")}
            style={{
              ...G.btn, padding:"14px 34px", fontSize:"clamp(14px,1.8vw,16px)", color:"#fff",
              background:"rgba(255,255,255,.1)", border:"1.5px solid rgba(255,255,255,.35)",
            }}
            onMouseOver={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.background="rgba(255,255,255,.18)"}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.background="rgba(255,255,255,.1)"}}
          >About Us</button>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:18, maxWidth:860, width:"100%", marginTop:72, animation:"fadeUp .85s ease .15s both", padding:"0 4px" }}>
        {[
          { icon:"✨", title:"Weekly Workshops", desc:"Learn shaders, rendering algorithms, and graphics APIs together." },
          { icon:"🖥️", title:"Project Showcases", desc:"Present your work and get feedback from fellow Gophers." },
          { icon:"🏆", title:"Competitions", desc:"Join demoscene competitions and game jams as a team." },
          { icon:"🔗", title:"Industry Connections", desc:"Network with alumni at studios and tech companies." },
        ].map((f,i) => (
          <div key={i} style={{
            ...G.glassCard, padding:"24px 22px", transition:"transform .22s ease, box-shadow .22s ease",
          }}
            onMouseOver={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow=`${G.glassCard.boxShadow},${G.glowGold}`}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=G.glassCard.boxShadow}}
          >
            <div className="shine-bar" />
            <div style={{ fontSize:30, marginBottom:10, position:"relative" }}>{f.icon}</div>
            <h3 style={{ fontFamily:G.ff, color:"#fff", margin:"0 0 8px", fontSize:15, fontWeight:700, position:"relative" }}>{f.title}</h3>
            <p style={{ fontFamily:G.ff, color:"rgba(255,225,195,.7)", fontSize:13, margin:0, lineHeight:1.55, position:"relative" }}>{f.desc}</p>
          </div>
        ))}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
