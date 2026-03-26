import React, { useState } from "react";
import { G } from "../constants/theme";

export function ImageCarousel({ images, height = 160, borderRadius = "0", fit = "cover" }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) {
    return (
      <div style={{ height, background:"linear-gradient(135deg,rgba(122,0,25,.6),rgba(180,100,0,.35))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:56, position:"relative", overflow:"hidden", borderRadius, borderBottom:"1px solid rgba(255,204,51,.18)" }}>
        <div style={{ position:"absolute",inset:0,background:"radial-gradient(circle at 30% 40%,rgba(255,204,51,.1),transparent 60%)" }} />
        <span style={{ fontFamily:G.ff, color:"rgba(255,220,180,.5)", fontSize:14 }}>No images</span>
      </div>
    );
  }

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };

  const arrowBtn = {
    position:"absolute", top:"50%", transform:"translateY(-50%)",
    width:32, height:32, borderRadius:"50%",
    background:"rgba(0,0,0,.45)", border:"1px solid rgba(255,255,255,.25)",
    color:"#fff", fontSize:16, cursor:"pointer",
    display:"flex", alignItems:"center", justifyContent:"center",
    backdropFilter:"blur(4px)", transition:"all .15s ease", zIndex:2,
  };

  return (
    <div style={{ height, position:"relative", overflow:"hidden", borderRadius, borderBottom:"1px solid rgba(255,204,51,.18)", background:"#0a0004" }}>
      <img
        src={images[idx]}
        alt={`Slide ${idx + 1}`}
        style={{ width:"100%", height:"100%", objectFit:fit, display:"block", transition:"opacity .25s ease" }}
      />
      {images.length > 1 && (
        <>
          <button onClick={prev} style={{ ...arrowBtn, left:8 }}
            onMouseOver={e=>e.currentTarget.style.background="rgba(0,0,0,.7)"}
            onMouseOut={e=>e.currentTarget.style.background="rgba(0,0,0,.45)"}>‹</button>
          <button onClick={next} style={{ ...arrowBtn, right:8 }}
            onMouseOver={e=>e.currentTarget.style.background="rgba(0,0,0,.7)"}
            onMouseOut={e=>e.currentTarget.style.background="rgba(0,0,0,.45)"}>›</button>
          {/* Dot indicators */}
          <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", display:"flex", gap:5, zIndex:2 }}>
            {images.map((_, i) => (
              <div
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                style={{
                  width: idx === i ? 18 : 6, height:6, borderRadius:3, cursor:"pointer",
                  background: idx === i ? G.gold : "rgba(255,255,255,.4)",
                  transition:"all .2s ease",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
