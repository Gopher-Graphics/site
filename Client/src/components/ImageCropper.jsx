import React, { useState, useRef } from "react";
import { G } from "../constants/theme";

const labelStyle = {
  fontFamily:G.ff, color:G.gold, fontSize:11, fontWeight:600,
  textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6, display:"block",
};

export function ImageCropper({ src, onCrop, onCancel, circular = false }) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [ratio, setRatio] = useState(1);
  const imgRef = useRef(null);

  React.useEffect(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, [src]);

  const handleStart = (x, y) => { setIsDragging(true); setLastPos({ x, y }); };
  const handleMove = (x, y) => {
    if (!isDragging) return;
    const dx = x - lastPos.x;
    const dy = y - lastPos.y;
    setPos(p => ({ x: p.x + dx, y: p.y + dy }));
    setLastPos({ x, y });
  };
  const handleEnd = () => setIsDragging(false);

  const performCrop = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = 600;
    canvas.width = size;
    canvas.height = size;

    const img = imgRef.current;
    if (!img || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return;

    const r = img.naturalWidth / img.naturalHeight;
    let w, h;
    if (r > 1) { h = size * zoom; w = h * r; }
    else { w = size * zoom; h = w / r; }

    const x = (size - w) / 2 + pos.x;
    const y = (size - h) / 2 + pos.y;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);
    
    if (circular) {
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
      ctx.clip();
    }
    
    ctx.drawImage(img, x, y, w, h);
    onCrop(canvas.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,.85)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }} onClick={e => e.stopPropagation()}>
      <div style={{ ...G.glass, width:"min(500px, 90vw)", padding:24, textAlign:"center", position:"relative", animation:"modalIn .25s ease" }}>
        <div className="shine-bar" />
        <h3 style={{ fontFamily:G.ff, color:G.gold, marginTop:0 }}>{circular ? "Crop Avatar" : "Crop & Position"}</h3>
        
        <div 
          style={{ 
            width:"100%", aspectRatio:"1/1", background:"#000", 
            borderRadius: circular ? "50%" : 12, 
            overflow:"hidden", position:"relative", cursor: isDragging ? "grabbing" : "grab", 
            border:"2.5px solid rgba(255,204,51,.34)" 
          }}
          onMouseDown={e => handleStart(e.clientX, e.clientY)}
          onMouseMove={e => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={e => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={e => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleEnd}
        >
          <img 
            ref={imgRef} src={src} alt="Cropping" 
            onLoad={e => setRatio(e.target.naturalWidth / e.target.naturalHeight)}
            style={{ 
              position:"absolute",
              width: ratio > 1 ? "auto" : "100%",
              height: ratio > 1 ? "100%" : "auto",
              maxWidth:"none", maxHeight:"none",
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${zoom})`,
              top: "50%", left: "50%",
              pointerEvents:"none",
              userSelect:"none"
            }} 
          />
          <div style={{ position:"absolute", inset:0, border:"2px solid rgba(255,204,51,.5)", borderRadius: circular ? "50%" : 12, pointerEvents:"none", boxShadow:"0 0 0 1000px rgba(0,0,0,0.4)" }} />
        </div>

        <div style={{ marginTop:20 }}>
          <label style={{ ...labelStyle, display:"flex", justifyContent:"space-between" }}>
            Zoom <span>{(zoom * 100).toFixed(0)}%</span>
          </label>
          <input 
            type="range" min="1" max="4" step="0.01" value={zoom} 
            onChange={e => setZoom(Number(e.target.value))}
            style={{ width:"100%", accentColor:G.gold, height:6, background:"rgba(255,255,255,.1)", borderRadius:3, appearance:"none" }}
          />
        </div>

        <div style={{ display:"flex", gap:12, marginTop:24 }}>
          <button onClick={performCrop} style={{ ...G.btn, flex:1, padding:12, color:"#3a0008" }}>Apply Crop</button>
          <button onClick={onCancel} style={{ ...G.btn, flex:1, padding:12, color:"#fff", background:"rgba(255,255,255,.1)", border:"1.5px solid rgba(255,255,255,.2)" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
