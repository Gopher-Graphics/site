import { useState } from "react";

interface ImageCarouselProps {
  images: string[];
  height?: number | string;
  borderRadius?: string;
  fit?: "cover" | "contain";
}

export function ImageCarousel({ images, height = 160, borderRadius = "0", fit = "cover" }: ImageCarouselProps) {
  const [idx, setIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center relative overflow-hidden"
        style={{ height, borderRadius, borderBottom:"1px solid rgba(255,204,51,.18)", background:"linear-gradient(135deg,rgba(122,0,25,.6),rgba(180,100,0,.35))" }}>
        <div className="absolute inset-0" style={{ background:"radial-gradient(circle at 30% 40%,rgba(255,204,51,.1),transparent 60%)" }} />
        <span className="font-ui text-[14px]" style={{ color:"rgba(255,220,180,.5)" }}>No images</span>
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };

  const arrowBase = "absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white text-base z-[2] transition-all duration-150";
  const arrowStyle = { background:"rgba(0,0,0,.45)", border:"1px solid rgba(255,255,255,.25)", backdropFilter:"blur(4px)" };

  return (
    <div className="relative overflow-hidden" style={{ height, borderRadius, borderBottom:"1px solid rgba(255,204,51,.18)", background:"#0a0004" }}>
      <img src={images[idx]} alt={`Slide ${idx + 1}`} className="w-full h-full block transition-opacity duration-[250ms]" style={{ objectFit: fit }} />
      {images.length > 1 && (
        <>
          <button onClick={prev} className={`${arrowBase} left-2`} style={arrowStyle}
            onMouseOver={e => e.currentTarget.style.background="rgba(0,0,0,.7)"}
            onMouseOut ={e => e.currentTarget.style.background="rgba(0,0,0,.45)"}>‹</button>
          <button onClick={next} className={`${arrowBase} right-2`} style={arrowStyle}
            onMouseOver={e => e.currentTarget.style.background="rgba(0,0,0,.7)"}
            onMouseOut ={e => e.currentTarget.style.background="rgba(0,0,0,.45)"}>›</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-[5px] z-[2]">
            {images.map((_, i) => (
              <div key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                className="h-1.5 rounded-[3px] cursor-pointer transition-all duration-200"
                style={{ width: idx === i ? 18 : 6, background: idx === i ? "#FFCC33" : "rgba(255,255,255,.4)" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
