import React, { useState, useRef } from "react";

export function ImageCropper({ src, onCrop, onCancel, circular = false }) {
  const [zoom, setZoom]             = useState(1);
  const [pos, setPos]               = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos]       = useState({ x: 0, y: 0 });
  const [ratio, setRatio]           = useState(1);
  const imgRef = useRef(null);

  React.useEffect(() => { setZoom(1); setPos({ x: 0, y: 0 }); }, [src]);

  const handleStart = (x, y) => { setIsDragging(true); setLastPos({ x, y }); };
  const handleMove  = (x, y) => {
    if (!isDragging) return;
    setPos(p => ({ x: p.x + (x - lastPos.x), y: p.y + (y - lastPos.y) }));
    setLastPos({ x, y });
  };
  const handleEnd = () => setIsDragging(false);

  const performCrop = () => {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d");
    const size   = 600;
    canvas.width = canvas.height = size;
    const img = imgRef.current;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const r = img.naturalWidth / img.naturalHeight;
    let w, h;
    if (r > 1) { h = size * zoom; w = h * r; } else { w = size * zoom; h = w / r; }
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);
    if (circular) { ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.clip(); }
    ctx.drawImage(img, (size - w) / 2 + pos.x, (size - h) / 2 + pos.y, w, h);
    onCrop(canvas.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background:"rgba(0,0,0,.85)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }}
      onClick={e => e.stopPropagation()}>
      <div className="glass w-[min(500px,90vw)] p-6 text-center relative animate-[modalIn_.25s_ease]">
        <div className="shine-bar" />
        <h3 className="font-ui text-gold mt-0 mb-4">{circular ? "Crop Avatar" : "Crop & Position"}</h3>

        {/* Canvas preview */}
        <div className="w-full aspect-square bg-black relative overflow-hidden"
          style={{ borderRadius: circular ? "50%" : 12, cursor: isDragging ? "grabbing" : "grab", border:"2.5px solid rgba(255,204,51,.34)" }}
          onMouseDown={e  => handleStart(e.clientX, e.clientY)}
          onMouseMove={e  => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd} onMouseLeave={handleEnd}
          onTouchStart={e => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={e  => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleEnd}>
          <img ref={imgRef} src={src} alt="Cropping"
            onLoad={e => setRatio(e.target.naturalWidth / e.target.naturalHeight)}
            className="absolute max-w-none max-h-none pointer-events-none select-none"
            style={{ width: ratio > 1 ? "auto" : "100%", height: ratio > 1 ? "100%" : "auto", top:"50%", left:"50%", transform:`translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${zoom})` }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{ border:"2px solid rgba(255,204,51,.5)", borderRadius: circular ? "50%" : 12, boxShadow:"0 0 0 1000px rgba(0,0,0,0.4)" }} />
        </div>

        {/* Zoom */}
        <div className="mt-5">
          <label className="label-gold flex justify-between">Zoom <span>{(zoom * 100).toFixed(0)}%</span></label>
          <input type="range" min="1" max="4" step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))}
            className="w-full h-1.5 rounded-[3px] appearance-none"
            style={{ accentColor:"#FFCC33", background:"rgba(255,255,255,.1)" }} />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={performCrop} className="btn-vista flex-1 py-3 text-[#3a0008]">Apply Crop</button>
          <button onClick={onCancel}   className="btn-ghost flex-1 py-3">Cancel</button>
        </div>
      </div>
    </div>
  );
}
