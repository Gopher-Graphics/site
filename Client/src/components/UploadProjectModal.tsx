import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../api/projects";
import { AssetIcon } from "./AssetIcon";
import { ImageCropper } from "./ImageCropper";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

interface UploadProjectModalProps {
  onClose: () => void;
  existingTags: string[];
}

export function UploadProjectModal({ onClose, existingTags }: UploadProjectModalProps) {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [title, setTitle]             = useState("");
  const [desc, setDesc]               = useState("");
  const [longDesc, setLongDesc]       = useState("");
  const [link, setLink]               = useState("");
  const [month, setMonth]             = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear]               = useState(currentYear);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag]           = useState("");
  const [previews, setPreviews]       = useState<string[]>([]);
  const [error, setError]             = useState("");
  const [dragOver, setDragOver]       = useState(false);
  const [croppingImg, setCroppingImg] = useState<string | null>(null);
  const [cropQueue, setCropQueue]     = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create project");
    }
  });

  const selectCls = "input-glass appearance-none pr-8 cursor-pointer";
  const isPending = createMutation.isPending;

  function handleFiles(files: FileList | File[]) {
    Array.from(files).filter(f => f.type.startsWith("image/")).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setCropQueue(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  useEffect(() => {
    if (!croppingImg && cropQueue.length > 0) {
      setCroppingImg(cropQueue[0]);
      setCropQueue(prev => prev.slice(1));
    }
  }, [cropQueue, croppingImg]);

  function handleCropComplete(d: string) { setPreviews(prev => [...prev, d]); setCroppingImg(null); }
  function removeImage(idx: number) { setPreviews(prev => prev.filter((_, i) => i !== idx)); }
  function toggleTag(tag: string) { setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]); }
  function addNewTag() { const t = newTag.trim(); if (t && !selectedTags.includes(t)) { setSelectedTags(prev => [...prev, t]); setNewTag(""); } }

  function handleSubmit() {
    if (!title.trim()) { setError("Title is required"); return; }
    if (!desc.trim())  { setError("Short description is required"); return; }
    if (selectedTags.length === 0) { setError("Select at least one tag"); return; }
    
    createMutation.mutate({
      title: title.trim(),
      description: desc.trim(),
      long_description: longDesc.trim() || desc.trim(),
      date_label: `${month} ${year}`,
      tags: selectedTags,
      images: previews,
      project_url: link.trim(),
      tech: selectedTags,
      highlights: []
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      {croppingImg && <ImageCropper key={croppingImg} src={croppingImg} onCrop={handleCropComplete} onCancel={() => setCroppingImg(null)} />}

      <div className="glass w-[min(720px,94vw)] max-h-[92vh] overflow-y-auto animate-[modalIn_.25s_cubic-bezier(.34,1.46,.64,1)]"
        style={{ borderRadius:18, clipPath:"inset(0 round 18px)", backgroundImage:"linear-gradient(168deg, rgba(255,255,255,.2) 0%, rgba(255,255,255,.06) 40%, rgba(122,0,25,.06) 100%)" }}
        onClick={e => e.stopPropagation()}>
        <div className="shine-bar" style={{ borderRadius:18 }} />

        {/* Header */}
        <div className="px-[clamp(20px,5vw,32px)] pt-[clamp(20px,4vw,28px)] pb-5 relative" style={{ borderBottom:"1px solid rgba(255,204,51,.1)" }}>
          <h2 className="font-ui text-white m-0 font-bold" style={{ fontSize:"clamp(18px,3vw,24px)", textShadow:"0 2px 16px rgba(255,204,51,.3)" }}>Upload New Project</h2>
          <p className="font-ui mt-1.5 m-0 text-[13px]" style={{ color:"rgba(255,225,195,.5)" }}>Share your work with the Gopher Graphics community</p>
        </div>

        {/* Form */}
        <div className={`px-[clamp(20px,5vw,32px)] pt-5 pb-[clamp(24px,5vw,32px)] flex flex-col gap-[18px] relative ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
          <div>
            <label className="label-gold">Project Title *</label>
            <input className="input-glass" value={title} onChange={e => { setTitle(e.target.value); setError(""); }} placeholder="e.g. Real-Time Ray Tracer" />
          </div>
          <div>
            <label className="label-gold">Short Description *</label>
            <input className="input-glass" value={desc} onChange={e => { setDesc(e.target.value); setError(""); }} placeholder="A brief one-liner about your project" />
          </div>
          <div>
            <label className="label-gold">Full Description</label>
            <textarea className="input-glass resize-y leading-[1.6]" rows={4} value={longDesc} onChange={e => setLongDesc(e.target.value)} placeholder="Detailed overview…" />
          </div>

          {/* Image upload */}
          <div>
            <label className="label-gold">Project Images</label>
            <div className="rounded-[14px] text-center cursor-pointer transition-all duration-200 p-[clamp(18px,4vw,28px)]"
              style={{ border:`2px dashed ${dragOver ? "#FFCC33" : "rgba(255,255,255,.18)"}`, background: dragOver ? "rgba(255,204,51,.06)" : "rgba(255,255,255,.03)", boxShadow: dragOver ? "0 0 20px rgba(255,204,51,0.3)" : "none" }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}>
              <AssetIcon name="picture" size={28} className="mb-2 mx-auto" />
              <p className="font-ui text-[14px] m-0" style={{ color:"rgba(255,225,195,.65)" }}>Drag &amp; drop images here or <span className="text-gold font-semibold">click to browse</span></p>
              <p className="font-ui text-[11px] mt-1 m-0" style={{ color:"rgba(255,210,170,.35)" }}>PNG, JPG, GIF up to 10MB each</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) handleFiles(e.target.files); }} />
            </div>
            {previews.length > 0 && (
              <div className="flex gap-2.5 mt-3.5 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden" style={{ width:110, height:80, border:"1.5px solid rgba(255,204,51,.4)", boxShadow:"0 4px 12px rgba(0,0,0,0.2)" }}>
                    <img src={src} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                    <button onClick={e => { e.stopPropagation(); removeImage(i); }}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background:"rgba(180,0,0,.85)" }}>×</button>
                    <div className="absolute bottom-0 inset-x-0 text-center text-white text-[9px] py-0.5 font-ui" style={{ background:"rgba(0,0,0,.45)" }}>IMAGE {i+1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="label-gold">Month</label>
              <div className="relative">
                <select className={selectCls} value={month} onChange={e => setMonth(e.target.value)}>
                  {MONTHS.map(m => <option key={m} value={m} style={{ background:"#1a0008", color:"#fff" }}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label-gold">Year</label>
              <div className="relative">
                <select className={selectCls} value={year} onChange={e => setYear(Number(e.target.value))}>
                  {YEARS.map(y => <option key={y} value={y} style={{ background:"#1a0008", color:"#fff" }}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="label-gold">Project Link</label>
            <input className="input-glass" value={link} onChange={e => setLink(e.target.value)} placeholder="https://github.com/yourname/project" />
          </div>

          {/* Tags */}
          <div>
            <label className="label-gold">Tags *</label>
            <div className="flex gap-2 flex-wrap mb-2.5">
              {(showAllTags ? existingTags : existingTags.slice(0, 6)).map(tag => {
                const active = selectedTags.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={active ? "btn-vista px-3.5 py-1 text-[12px] text-[#3a0008]" : "btn-ghost px-3.5 py-1 text-[12px] text-[rgba(255,225,195,.75)]"}>
                    {tag}
                  </button>
                );
              })}
              {existingTags.length > 6 && (
                <button onClick={() => setShowAllTags(!showAllTags)}
                  className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold hover:underline">
                  {showAllTags ? "Show Less" : `Show All (${existingTags.length})`}
                </button>
              )}
            </div>
            {selectedTags.filter(t => !existingTags.includes(t)).length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2.5">
                {selectedTags.filter(t => !existingTags.includes(t)).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-ui text-gold text-[12px]"
                    style={{ background:"rgba(255,204,51,.12)", border:"1px solid rgba(255,204,51,.3)" }}>
                    {tag}
                    <button onClick={() => toggleTag(tag)} className="text-gold text-sm leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input className="input-glass flex-1" value={newTag} onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addNewTag())}
                placeholder="Add a custom tag…" />
              <button onClick={addNewTag} className="btn-vista px-[18px] text-[13px] text-[#3a0008] flex-shrink-0">+ Add</button>
            </div>
          </div>

          {error && (
            <p className="font-ui text-[#ff8888] text-[13px] m-0 text-center px-3.5 py-2 rounded-lg" style={{ background:"rgba(255,0,0,.06)", border:"1px solid rgba(255,80,80,.15)" }}>{error}</p>
          )}

          <div className="flex gap-3 mt-1">
            <button onClick={handleSubmit} className="btn-vista flex-1 py-3.5 text-[15px] text-[#3a0008]">
              {isPending ? "Uploading..." : "Upload Project"}
            </button>
            <button onClick={onClose} className="btn-ghost px-7 py-3.5 text-[15px]">Cancel</button>
          </div>
        </div>

        <button onClick={onClose}
          className="absolute top-3.5 right-4 w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ background:"rgba(0,0,0,.25)", border:"1px solid rgba(255,255,255,.15)", color:"rgba(255,255,255,.6)" }}>×</button>
      </div>
    </div>,
    document.body
  );
}
