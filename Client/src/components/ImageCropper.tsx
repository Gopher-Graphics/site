import { useState, useRef } from "react";

interface ImageCropperProps {
  src: string;
  onCrop: (d: string) => void;
  onCancel: () => void;
  circular?: boolean;
}

export function ImageCropper({ src, onCrop, onCancel, circular = false }: ImageCropperProps) {
  const [zoom, setZoom]             = useState(1);
  const [pos, setPos]               = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos]       = useState({ x: 0, y: 0 });
  const [ratio, setRatio]           = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);



  const handleStart = (x: number, y: number) => { setIsDragging(true); setLastPos({ x, y }); };
  const handleMove  = (x: number, y: number) => {
    if (!isDragging) return;
    setPos(p => ({ x: p.x + (x - lastPos.x), y: p.y + (y - lastPos.y) }));
    setLastPos({ x, y });
  };
  const handleEnd = () => setIsDragging(false);

  const performCrop = () => {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d");
    if (!ctx) return;
    
    // Use 16:9 for projects, 1:1 for circular (avatars)
    const baseSize = 800;
    const canvasWidth = baseSize;
    const canvasHeight = circular ? baseSize : Math.round(baseSize * (9 / 16));
    
    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;
    
    const img = imgRef.current;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const r = img.naturalWidth / img.naturalHeight;
    
    let w: number, h: number;
    // Fit image to fill the canvas based on its orientation
    const canvasRatio = canvasWidth / canvasHeight;
    if (r > canvasRatio) { 
        h = canvasHeight * zoom; 
        w = h * r; 
    } else { 
        w = canvasWidth * zoom; 
        h = w / r; 
    }
    
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    if (circular) { 
        ctx.beginPath(); 
        ctx.arc(canvasWidth/2, canvasHeight/2, canvasHeight/2, 0, Math.PI*2); 
        ctx.clip(); 
    }
    
    ctx.drawImage(img, (canvasWidth - w) / 2 + pos.x, (canvasHeight - h) / 2 + pos.y, w, h);
    onCrop(canvas.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background:"rgba(0,0,0,.85)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }}
      onClick={e => e.stopPropagation()}>
      <div className="glass w-[min(500px,90vw)] p-6 text-center relative animate-[modalIn_.25s_ease]">
        <div className="shine-bar" />
        <h3 className="font-ui text-gold mt-0 mb-4">{circular ? "Crop Avatar" : "Crop & Position"}</h3>

        {/* Canvas preview */}
        <div className="w-full bg-black relative overflow-hidden"
          style={{ 
            aspectRatio: circular ? "1/1" : "16/9",
            borderRadius: circular ? "50%" : 12, 
            cursor: isDragging ? "grabbing" : "grab", 
            border:"2.5px solid rgba(255,204,51,.34)" 
          }}
          onMouseDown={e  => handleStart(e.clientX, e.clientY)}
          onMouseMove={e  => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd} onMouseLeave={handleEnd}
          onTouchStart={e => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={e  => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleEnd}>
          <img ref={imgRef} src={src} alt="Cropping"
            onLoad={e => {
              const target = e.target as HTMLImageElement;
              setRatio(target.naturalWidth / target.naturalHeight);
            }}
            className="absolute max-w-none max-h-none pointer-events-none select-none"
            style={{ 
                width: ratio > (circular ? 1 : 16/9) ? "auto" : "100%", 
                height: ratio > (circular ? 1 : 16/9) ? "100%" : "auto", 
                top:"50%", 
                left:"50%", 
                transform:`translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${zoom})` 
            }} />
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
