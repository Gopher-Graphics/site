import React, { useState } from "react";
import { G } from "../constants/theme";
import { ProjectDetailModal } from "../components/ProjectDetailModal";
import { ImageCarousel } from "../components/ImageCarousel";

export function ProjectsPage({ projects }) {
  const [filter, setFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const allTags = ["All",...Array.from(new Set(projects.flatMap(p=>p.tags)))];
  const filtered = filter==="All" ? projects : projects.filter(p=>p.tags.includes(filter));
  return (
    <>
    <div style={{ minHeight:"100vh", padding:"clamp(32px,5vw,48px) clamp(16px,4vw,32px) 60px", maxWidth:1100, margin:"0 auto" }}>
      <div style={{ animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontFamily:G.ff, color:"#fff", fontSize:"clamp(26px,4vw,48px)", fontWeight:700, margin:"0 0 4px", textShadow:"0 2px 24px rgba(255,204,51,.4)" }}>Member Projects</h1>
        <div style={{ width:60, height:3, background:"linear-gradient(90deg,#FFCC33,transparent)", borderRadius:2, marginBottom:10 }} />
        <p style={{ fontFamily:G.ff, color:"rgba(255,225,195,.6)", marginBottom:28, fontSize:15 }}>Work created by Gopher Graphics members</p>

        {/* Tag filters */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:36 }}>
          {allTags.map(t => (
            <button key={t} onClick={()=>setFilter(t)} style={{
              ...G.btn, padding:"6px 18px", fontSize:13,
              color: filter===t ? "#3a0008" : "rgba(255,225,190,.85)",
              background: filter===t
                ? "linear-gradient(180deg,rgba(255,255,255,.95) 0%,rgba(255,240,180,.8) 46%,rgba(210,155,40,.85) 50%,rgba(255,235,160,.7) 51%,rgba(255,245,200,.58) 100%)"
                : "rgba(255,255,255,.08)",
              border: filter===t ? "1.5px solid rgba(255,255,255,.85)" : "1.5px solid rgba(255,255,255,.18)",
              boxShadow: filter===t ? `${G.btn.boxShadow}, ${G.glowGold}` : "none",
              transition:"all .15s ease",
            }}>{t}</button>
          ))}
        </div>

        {/* Project grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(clamp(250px,40vw,300px),1fr))", gap:22 }}>
          {filtered.map((p,i) => (
            <div key={p.id} onClick={()=>setSelectedProject(p)} style={{
              ...G.glassCard, padding:0, overflow:"hidden", cursor:"pointer",
              animation:`fadeUp .5s ease ${i*.06}s both`,
              transition:"transform .22s ease, box-shadow .22s ease",
            }}
              onMouseOver={e=>{e.currentTarget.style.transform="translateY(-6px) scale(1.015)";e.currentTarget.style.boxShadow=`0 24px 56px rgba(80,0,15,.3), ${G.glowGold}`}}
              onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=G.glassCard.boxShadow}}
            >
              <div className="shine-bar" style={{ zIndex:2 }} />
              {/* Image area */}
              {p.images && p.images.length > 0 ? (
                <ImageCarousel images={p.images} height={150} />
              ) : (
                <div style={{ height:130, background:"linear-gradient(135deg,rgba(122,0,25,.55),rgba(180,100,0,.3))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:56, position:"relative", overflow:"hidden", borderBottom:"1px solid rgba(255,204,51,.15)" }}>
                  <div style={{ position:"absolute",inset:0,background:"radial-gradient(circle at 30% 40%,rgba(255,204,51,.08),transparent 60%)" }} />
                  {p.img}
                </div>
              )}
              <div style={{ padding:"18px 20px", position:"relative" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:8 }}>
                  <h3 style={{ fontFamily:G.ff, color:"#fff", margin:0, fontSize:16, fontWeight:700 }}>{p.title}</h3>
                  <span style={{ fontFamily:G.ff, color:"rgba(255,210,170,.45)", fontSize:11, flexShrink:0, marginLeft:8 }}>{p.date}</span>
                </div>
                <p style={{ fontFamily:G.ff, color:"rgba(255,225,200,.62)", fontSize:13, margin:"0 0 14px", lineHeight:1.5 }}>{p.desc}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6 }}>
                  <span style={{ fontFamily:G.ff, color:"rgba(255,215,175,.72)", fontSize:12 }}>by {p.author}</span>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {p.tags.map(t=><span key={t} style={{ background:"rgba(122,0,25,.25)", border:"1px solid rgba(255,204,51,.25)", borderRadius:"20px", padding:"2px 10px", fontFamily:G.ff, color:"rgba(255,225,150,.9)", fontSize:11 }}>{t}</span>)}
                  </div>
                </div>
                <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,204,51,.08)", textAlign:"center" }}>
                  <span style={{ fontFamily:G.ff, color:"rgba(255,204,51,.55)", fontSize:12, letterSpacing:"0.04em" }}>View Details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
    {selectedProject && <ProjectDetailModal project={selectedProject} onClose={()=>setSelectedProject(null)} />}
    </>
  );
}
