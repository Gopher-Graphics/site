import { Project } from "../types";
import { ImageCarousel } from "./ImageCarousel";

interface ProjectDetailModalProps {
  project: Project & { images?: string[] };
  onClose: () => void;
}

export function ProjectDetailModal({ project: p, onClose }: ProjectDetailModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass w-[min(720px,94vw)] max-h-[92vh] overflow-y-auto animate-[modalIn_.25s_cubic-bezier(.34,1.46,.64,1)]"
        style={{ backgroundImage:"linear-gradient(168deg, rgba(255,255,255,.18) 0%, rgba(255,255,255,.06) 40%, rgba(122,0,25,.06) 100%)" }}
        onClick={e => e.stopPropagation()}>

        {/* Image area */}
        {p.images && p.images.length > 0 ? (
          <ImageCarousel images={p.images} height={400} borderRadius="18px 18px 0 0" fit="contain" />
        ) : (
          <div className="h-40 flex items-center justify-center relative overflow-hidden flex-shrink-0"
            style={{ background:"linear-gradient(135deg,rgba(122,0,25,.65),rgba(180,100,0,.35))", borderRadius:"18px 18px 0 0", borderBottom:"1px solid rgba(255,204,51,.18)" }}>
            <div className="absolute inset-0" style={{ background:"radial-gradient(circle at 30% 50%,rgba(255,204,51,.1),transparent 65%)" }} />
            <div className="absolute top-0 left-0 right-0 h-1/2" style={{ background:"linear-gradient(180deg,rgba(255,255,255,.12),transparent)", borderRadius:"18px 18px 0 0" }} />
            <span className="relative font-ui font-bold text-3xl tracking-[0.04em]" style={{ color:"rgba(255,204,51,.5)" }}>
              {p.title.slice(0, 3).toUpperCase()}
            </span>
          </div>
        )}

        <div className="px-[clamp(20px,5vw,32px)] pt-[clamp(20px,4vw,28px)] pb-[clamp(24px,5vw,32px)]">
          <div className="flex justify-between items-start mb-1.5 flex-wrap gap-2.5">
            <h2 className="font-ui text-white m-0 font-bold" style={{ fontSize:"clamp(20px,3vw,26px)", textShadow:"0 2px 16px rgba(255,204,51,.3)" }}>{p.title}</h2>
            <span className="font-ui text-[13px] mt-1" style={{ color:"rgba(255,210,170,.45)" }}>{p.date}</span>
          </div>
          <div className="flex items-center gap-3 mb-[22px] flex-wrap">
            <span className="font-ui text-gold text-[14px] font-semibold">by {p.author}</span>
            {p.tags.map(t => <span key={t} className="tag-pill">{t}</span>)}
          </div>
          <div className="h-px mb-[22px]" style={{ background:"linear-gradient(90deg,rgba(255,204,51,.35),transparent)" }} />
          <p className="font-ui text-[14.5px] leading-[1.75] mb-[26px]" style={{ color:"rgba(255,235,215,.84)" }}>{p.longDesc}</p>

          {p.tech && p.tech.length > 0 && (
            <div className="mb-[26px]">
              <h4 className="font-ui text-gold m-0 mb-3 text-[13px] uppercase tracking-[.08em] opacity-85">Tech Stack</h4>
              <div className="flex gap-2 flex-wrap">
                {p.tech.map(t => (
                  <span key={t} className="px-3.5 py-1.5 rounded-lg text-[13px] font-ui"
                    style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.2)", color:"rgba(255,240,220,.88)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {p.preview && p.preview.length > 0 && (
            <div className="mb-7">
              <h4 className="font-ui text-gold m-0 mb-3 text-[13px] uppercase tracking-[.08em] opacity-85">Highlights</h4>
              {p.preview.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-[10px] px-4 py-2.5 mb-2"
                  style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,204,51,.1)" }}>
                  <span className="text-gold text-sm flex-shrink-0">◆</span>
                  <span className="font-ui text-[13.5px]" style={{ color:"rgba(255,230,205,.8)" }}>{item}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {p.github && (
              <button onClick={() => window.open(p.github.startsWith("http") ? p.github : `https://${p.github}`, "_blank")}
                className="btn-vista px-[26px] py-2.5 text-sm text-[#3a0008]">View on GitHub</button>
            )}
            <button onClick={onClose} className="btn-ghost px-[26px] py-2.5 text-sm">← Back</button>
          </div>
        </div>

        <button onClick={onClose}
          className="absolute top-3.5 right-4 w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ background:"rgba(0,0,0,.3)", border:"1px solid rgba(255,255,255,.2)", color:"rgba(255,255,255,.65)" }}>×</button>
      </div>
    </div>
  );
}
