import React from "react";
import { G } from "../constants/theme";
import { ImageCarousel } from "./ImageCarousel";

export function ProjectDetailModal({ project:p, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(15,0,4,.6)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", padding:"16px" }} onClick={onClose}>
      <div style={{
        ...G.glass, width:"min(720px, 94vw)", maxHeight:"92vh", overflowY:"auto", position:"relative",
        animation:"modalIn .25s cubic-bezier(.34,1.46,.64,1)",
        backgroundImage:"linear-gradient(168deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,.06) 40%, rgba(122,0,25,.06) 100%)",
      }} onClick={e=>e.stopPropagation()}>
        {/* Image area */}
        {p.images && p.images.length > 0 ? (
          <ImageCarousel images={p.images} height={400} borderRadius="18px 18px 0 0" fit="contain" />
        ) : (
          <div style={{ height:160, background:"linear-gradient(135deg,rgba(122,0,25,.65),rgba(180,100,0,.35))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:80, position:"relative", overflow:"hidden", borderRadius:"18px 18px 0 0", borderBottom:"1px solid rgba(255,204,51,.18)", flexShrink:0 }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 30% 50%,rgba(255,204,51,.1),transparent 65%)" }} />
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"48%", background:"linear-gradient(180deg,rgba(255,255,255,.12),transparent)", borderRadius:"18px 18px 0 0" }} />
            <span style={{ position:"relative", filter:"drop-shadow(0 4px 16px rgba(255,204,51,.3))" }}>{p.img}</span>
          </div>
        )}

        <div style={{ padding:"clamp(20px,4vw,28px) clamp(20px,5vw,32px) clamp(24px,5vw,32px)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:6, flexWrap:"wrap", gap:10 }}>
            <h2 style={{ fontFamily:G.ff, color:"#fff", margin:0, fontSize:"clamp(20px,3vw,26px)", fontWeight:700, textShadow:"0 2px 16px rgba(255,204,51,.3)" }}>{p.title}</h2>
            <span style={{ fontFamily:G.ff, color:"rgba(255,210,170,.45)", fontSize:13, marginTop:4 }}>{p.date}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22, flexWrap:"wrap" }}>
            <span style={{ fontFamily:G.ff, color:G.gold, fontSize:14, fontWeight:600 }}>by {p.author}</span>
            {p.tags.map(t => <span key={t} style={{ background:"rgba(122,0,25,.3)", border:"1px solid rgba(255,204,51,.3)", borderRadius:20, padding:"3px 12px", fontFamily:G.ff, color:"rgba(255,225,155,.95)", fontSize:12 }}>{t}</span>)}
          </div>
          <div style={{ height:1, background:"linear-gradient(90deg,rgba(255,204,51,.35),transparent)", marginBottom:22 }} />
          <p style={{ fontFamily:G.ff, color:"rgba(255,235,215,.84)", fontSize:14.5, lineHeight:1.75, margin:"0 0 26px" }}>{p.longDesc}</p>

          {p.tech && p.tech.length > 0 && (
            <div style={{ marginBottom:26 }}>
              <h4 style={{ fontFamily:G.ff, color:G.gold, margin:"0 0 12px", fontSize:13, textTransform:"uppercase", letterSpacing:".08em", opacity:.85 }}>Tech Stack</h4>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {p.tech.map(t => <span key={t} style={{
                  background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.2)",
                  borderRadius:8, padding:"5px 14px", fontFamily:G.ff, color:"rgba(255,240,220,.88)", fontSize:13,
                  backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)",
                }}>{t}</span>)}
              </div>
            </div>
          )}

          {p.preview && p.preview.length > 0 && (
            <div style={{ marginBottom:28 }}>
              <h4 style={{ fontFamily:G.ff, color:G.gold, margin:"0 0 12px", fontSize:13, textTransform:"uppercase", letterSpacing:".08em", opacity:.85 }}>Highlights</h4>
              {p.preview.map((item,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,204,51,.1)", borderRadius:10, padding:"10px 16px", marginBottom:8 }}>
                  <span style={{ color:G.gold, fontSize:14, flexShrink:0 }}>◆</span>
                  <span style={{ fontFamily:G.ff, color:"rgba(255,230,205,.8)", fontSize:13.5 }}>{item}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {p.github && <button onClick={()=>window.open(p.github.startsWith("http")?p.github:`https://${p.github}`,"_blank")} style={{ ...G.btn, padding:"10px 26px", fontSize:14, color:"#3a0008" }}>🔗 View on GitHub</button>}
            <button onClick={onClose} style={{ ...G.btn, padding:"10px 26px", fontSize:14, color:"#fff", background:"rgba(255,255,255,.08)", border:"1.5px solid rgba(255,255,255,.25)" }}>← Back</button>
          </div>
        </div>

        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"rgba(0,0,0,.3)", border:"1px solid rgba(255,255,255,.2)", color:"rgba(255,255,255,.65)", fontSize:18, cursor:"pointer", borderRadius:"50%", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        <style>{`@keyframes modalIn{from{transform:scale(.9) translateY(24px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}`}</style>
      </div>
    </div>
  );
}
