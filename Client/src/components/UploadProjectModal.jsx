import React, { useState, useRef } from "react";
import { G } from "../constants/theme";
import { ImageCropper } from "./ImageCropper";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const inputStyle = {
  width:"100%", padding:"11px 14px",
  background:"rgba(255,255,255,.1)", border:"1.5px solid rgba(255,255,255,.25)",
  borderRadius:"10px", fontFamily:G.ff, fontSize:14, color:"#fff", outline:"none",
  boxShadow:"inset 0 2px 6px rgba(60,0,10,.1)", boxSizing:"border-box",
  transition:"border-color .2s ease, box-shadow .2s ease",
};

const selectStyle = {
  ...inputStyle,
  appearance:"none",
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,204,51,.6)' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
  backgroundRepeat:"no-repeat",
  backgroundPosition:"right 12px center",
  cursor:"pointer",
};

const labelStyle = {
  fontFamily:G.ff, color:G.gold, fontSize:11, fontWeight:600,
  textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6, display:"block",
};

const focusInput = (e) => { e.target.style.borderColor="rgba(255,204,51,.6)"; e.target.style.boxShadow="inset 0 2px 6px rgba(60,0,10,.1), 0 0 12px rgba(255,204,51,.12)"; };
const blurInput = (e) => { e.target.style.borderColor="rgba(255,255,255,.25)"; e.target.style.boxShadow="inset 0 2px 6px rgba(60,0,10,.1)"; };


export function UploadProjectModal({ onClose, onSubmit, existingTags }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [link, setLink] = useState("");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(currentYear);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [croppingImg, setCroppingImg] = useState(null);
  const [cropQueue, setCropQueue] = useState([]);
  const fileRef = useRef(null);

  function handleFiles(files) {
    const fileArr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (fileArr.length === 0) return;
    
    fileArr.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropQueue(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  }

  React.useEffect(() => {
    if (!croppingImg && cropQueue.length > 0) {
      setCroppingImg(cropQueue[0]);
      setCropQueue(prev => prev.slice(1));
    }
  }, [cropQueue, croppingImg]);

  function handleCropComplete(croppedData) {
    setPreviews(prev => [...prev, croppedData]);
    setCroppingImg(null);
  }

  function removeImage(idx) {
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  function toggleTag(tag) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function addNewTag() {
    const t = newTag.trim();
    if (t && !selectedTags.includes(t)) { setSelectedTags(prev => [...prev, t]); setNewTag(""); }
  }

  function handleSubmit() {
    if (!title.trim()) { setError("Title is required"); return; }
    if (!desc.trim()) { setError("Short description is required"); return; }
    if (selectedTags.length === 0) { setError("Select at least one tag"); return; }
    onSubmit({
      id: Date.now(), title:title.trim(), desc:desc.trim(),
      longDesc: longDesc.trim() || desc.trim(), date:`${month} ${year}`,
      tags:selectedTags, images:previews, img:previews[0]||null,
      github:link.trim(), tech:selectedTags, preview:[],
    });
    onClose();
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(15,0,4,.6)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", padding:"16px" }} onClick={onClose}>
      {croppingImg && (
        <ImageCropper 
          src={croppingImg} 
          onCrop={handleCropComplete} 
          onCancel={() => setCroppingImg(null)} 
        />
      )}
      
      <div style={{
        ...G.glass, width:"min(720px, 94vw)", maxHeight:"92vh", overflowY:"auto", position:"relative",
        animation:"modalIn .25s cubic-bezier(.34,1.46,.64,1)",
        backgroundImage:"linear-gradient(168deg, rgba(255,255,255,.2) 0%, rgba(255,255,255,.06) 40%, rgba(122,0,25,.06) 100%)",
      }} onClick={e=>e.stopPropagation()}>
        <div className="shine-bar" style={{ borderRadius:18 }} />

        {/* Header */}
        <div style={{ padding:"clamp(20px,4vw,28px) clamp(20px,5vw,32px) 0", borderBottom:"1px solid rgba(255,204,51,.1)", paddingBottom:20, position:"relative" }}>
          <h2 style={{ fontFamily:G.ff, color:"#fff", margin:0, fontSize:"clamp(18px,3vw,24px)", fontWeight:700, textShadow:"0 2px 16px rgba(255,204,51,.3)" }}>Upload New Project</h2>
          <p style={{ fontFamily:G.ff, color:"rgba(255,225,195,.5)", fontSize:13, marginTop:6, margin:0 }}>Share your work with the Gopher Graphics community</p>
        </div>

        {/* Form */}
        <div style={{ padding:"20px clamp(20px,5vw,32px) clamp(24px,5vw,32px)", display:"flex", flexDirection:"column", gap:18, position:"relative" }}>
          <div>
            <label style={labelStyle}>Project Title *</label>
            <input value={title} onChange={e=>{setTitle(e.target.value);setError("")}} placeholder="e.g. Real-Time Ray Tracer" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
          </div>

          <div>
            <label style={labelStyle}>Short Description *</label>
            <input value={desc} onChange={e=>{setDesc(e.target.value);setError("")}} placeholder="A brief one-liner about your project" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
          </div>

          <div>
            <label style={labelStyle}>Full Description</label>
            <textarea value={longDesc} onChange={e=>setLongDesc(e.target.value)} placeholder="Detailed overview…" rows={4} style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} onFocus={focusInput} onBlur={blurInput} />
          </div>

          {/* Images */}
          <div>
            <label style={labelStyle}>Project Images</label>
            <div
              onDragOver={e=>{e.preventDefault();setDragOver(true)}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files)}}
              onClick={()=>fileRef.current?.click()}
              style={{
                border:`2px dashed ${dragOver ? G.gold : "rgba(255,255,255,.18)"}`,
                borderRadius:14, padding:"clamp(18px,4vw,28px) 20px", textAlign:"center", cursor:"pointer",
                background: dragOver ? "rgba(255,204,51,.06)" : "rgba(255,255,255,.03)",
                transition:"all .2s ease",
                boxShadow: dragOver ? G.glowGold : "none",
              }}
            >
              <div style={{ fontSize:32, marginBottom:6 }}>📸</div>
              <p style={{ fontFamily:G.ff, color:"rgba(255,225,195,.65)", fontSize:14, margin:0 }}>
                Drag & drop images here or <span style={{ color:G.gold, fontWeight:600 }}>click to browse</span>
              </p>
              <p style={{ fontFamily:G.ff, color:"rgba(255,210,170,.35)", fontSize:11, marginTop:4, margin:0 }}>PNG, JPG, GIF up to 10MB each</p>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e=>handleFiles(e.target.files)} />
            </div>
            {previews.length > 0 && (
              <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position:"relative", width:110, height:80, borderRadius:8, overflow:"hidden", border:"1.5px solid rgba(255,204,51,.4)", boxShadow:"0 4px 12px rgba(0,0,0,0.2)" }}>
                    <img src={src} alt={`Preview ${i+1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    <button onClick={e=>{e.stopPropagation();removeImage(i)}} style={{ position:"absolute", top:3, right:3, width:20, height:20, borderRadius:"50%", background:"rgba(180,0,0,.85)", border:"none", color:"#fff", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                    <div style={{ position:"absolute", bottom:0, insetX:0, background:"rgba(0,0,0,.45)", color:"#fff", fontSize:9, padding:"2px 0", textAlign:"center", fontFamily:G.ff }}>IMAGE {i+1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={labelStyle}>Month</label>
              <select value={month} onChange={e=>setMonth(e.target.value)} style={selectStyle}>
                {MONTHS.map(m => <option key={m} value={m} style={{ background:"#1a0008", color:"#fff" }}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year</label>
              <select value={year} onChange={e=>setYear(Number(e.target.value))} style={selectStyle}>
                {YEARS.map(y => <option key={y} value={y} style={{ background:"#1a0008", color:"#fff" }}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Link */}
          <div>
            <label style={labelStyle}>Project Link</label>
            <input value={link} onChange={e=>setLink(e.target.value)} placeholder="https://github.com/yourname/project" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
          </div>

          {/* Tags */}
          <div>
            <label style={labelStyle}>Tags *</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
              {existingTags.map(tag => (
                <button key={tag} onClick={()=>toggleTag(tag)} style={{
                  ...G.btn, padding:"5px 14px", fontSize:12,
                  color: selectedTags.includes(tag) ? "#3a0008" : "rgba(255,225,195,.75)",
                  background: selectedTags.includes(tag)
                    ? G.btn.background : "rgba(255,255,255,.06)",
                  border: selectedTags.includes(tag)
                    ? "1.5px solid rgba(255,255,255,.85)" : "1.5px solid rgba(255,255,255,.15)",
                  boxShadow: selectedTags.includes(tag) ? G.glowGold : "none",
                  transition:"all .15s ease",
                }}>{tag}</button>
              ))}
            </div>
            {selectedTags.filter(t => !existingTags.includes(t)).length > 0 && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                {selectedTags.filter(t => !existingTags.includes(t)).map(tag => (
                  <span key={tag} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,204,51,.12)", border:"1px solid rgba(255,204,51,.3)", borderRadius:20, padding:"4px 12px", fontFamily:G.ff, color:G.gold, fontSize:12 }}>
                    {tag}
                    <button onClick={()=>toggleTag(tag)} style={{ background:"none", border:"none", color:G.gold, cursor:"pointer", fontSize:14, padding:0, lineHeight:1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display:"flex", gap:8 }}>
              <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addNewTag())} placeholder="Add a custom tag…" style={{ ...inputStyle, flex:1 }} onFocus={focusInput} onBlur={blurInput} />
              <button onClick={addNewTag} style={{ ...G.btn, padding:"8px 18px", fontSize:13, color:"#3a0008", flexShrink:0 }}>+ Add</button>
            </div>
          </div>

          {error && <p style={{ fontFamily:G.ff, color:"#ff8888", fontSize:13, margin:0, textAlign:"center", background:"rgba(255,0,0,.06)", padding:"8px 14px", borderRadius:8, border:"1px solid rgba(255,80,80,.15)" }}>{error}</p>}

          <div style={{ display:"flex", gap:12, marginTop:4 }}>
            <button onClick={handleSubmit} style={{ ...G.btn, flex:1, padding:"13px", fontSize:15, color:"#3a0008" }}>🚀 Upload Project</button>
            <button onClick={onClose} style={{ ...G.btn, padding:"13px 28px", fontSize:15, color:"#fff", background:"rgba(255,255,255,.06)", border:"1.5px solid rgba(255,255,255,.22)" }}>Cancel</button>
          </div>
        </div>

        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"rgba(0,0,0,.25)", border:"1px solid rgba(255,255,255,.15)", color:"rgba(255,255,255,.6)", fontSize:18, cursor:"pointer", borderRadius:"50%", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        <style>{`@keyframes modalIn{from{transform:scale(.9) translateY(24px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}`}</style>
      </div>
    </div>
  );
}

