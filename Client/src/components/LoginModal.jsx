import React, { useState } from "react";
import { G } from "../constants/theme";
import { ImageCropper } from "./ImageCropper";

import avatar1 from "../assets/avatars/1.jpeg";
import avatar2 from "../assets/avatars/2.jpeg";
import avatar3 from "../assets/avatars/3.jpeg";
import avatar4 from "../assets/avatars/4.jpeg";
import avatar5 from "../assets/avatars/5.jpeg";
import avatar6 from "../assets/avatars/6.jpeg";
import avatar7 from "../assets/avatars/7.jpeg";
import avatar8 from "../assets/avatars/8.jpeg";

const DEFAULT_AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8];

export function LoginModal({ onClose, onLogin, onCreateAccount, users }) {
  const [isCreate, setIsCreate] = useState(false);
  const [x500, setX500] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(avatar7);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [croppingImg, setCroppingImg] = useState(null);
  const fileRef = React.useRef(null);

  const inputStyle = {
    width:"100%", padding:"11px 14px",
    background:"rgba(255,255,255,.12)", border:"1.5px solid rgba(255,255,255,.35)",
    borderRadius:"10px", fontFamily:G.ff, fontSize:14, color:"#fff", outline:"none",
    boxShadow:"inset 0 2px 8px rgba(60,0,10,.15)", boxSizing:"border-box",
    transition:"border-color .2s ease, box-shadow .2s ease",
  };

  function triggerShake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return; }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCroppingImg(ev.target.result);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  function handleCropComplete(croppedData) {
    setAvatar(croppedData);
    setCroppingImg(null);
  }

  function handleSubmit() {
    if (isCreate) {
      if (!name.trim() || !x500.trim() || !pass.trim()) { setError("Please fill all fields"); triggerShake(); return; }
      if (users.some(u => u.x500 === x500.trim())) { setError("That x500 is already taken"); triggerShake(); return; }
      onCreateAccount({ x500:x500.trim(), password:pass, name:name.trim(), role:"Member", avatar });
    } else {
      const u = users.find(u => u.x500 === x500.trim() && u.password === pass);
      if (u) { onLogin(u); onClose(); }
      else { setError("Invalid x500 or password. Try: demo / demo"); triggerShake(); }
    }
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(15,0,4,.6)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", padding:"16px" }} onClick={onClose}>
      {croppingImg && (
        <ImageCropper 
          src={croppingImg} 
          onCrop={handleCropComplete} 
          onCancel={() => setCroppingImg(null)} 
          circular={true}
        />
      )}
      <div style={{
        ...G.glass, width:"min(400px, 92vw)", padding:"36px clamp(20px,5vw,32px)", position:"relative",
        animation: shaking ? "shake .4s ease" : "modalIn .22s cubic-bezier(.34,1.56,.64,1)",
        backgroundImage:"linear-gradient(168deg, rgba(255,255,255,.2) 0%, rgba(255,255,255,.08) 40%, rgba(122,0,25,.08) 100%)",
      }} onClick={e => e.stopPropagation()}>
        <div className="shine-bar" style={{ borderRadius:18 }} />

        <div style={{ textAlign:"center", marginBottom:24, position:"relative" }}>
          {isCreate ? (
            <div style={{ 
              width:80, height:80, borderRadius:"50%", margin:"0 auto 12px",
              border:`3px solid ${G.gold}`, boxShadow:G.glowGold, overflow:"hidden",
              background:"rgba(122,0,25,.45)"
            }}>
              <img src={avatar} alt="Avatar Preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
          ) : (
            <div style={{ fontSize:40, marginBottom:8, filter:`drop-shadow(0 2px 12px rgba(255,204,51,.3))` }}>🦫</div>
          )}
          <h2 style={{ fontFamily:G.ff, color:"#fff", margin:0, fontSize:22, fontWeight:700, textShadow:"0 2px 16px rgba(255,204,51,.4)" }}>
            {isCreate ? "Join Gopher Graphics" : "Member Login"}
          </h2>
          <p style={{ color:"rgba(255,225,195,.6)", fontSize:13, marginTop:6, fontFamily:G.ff }}>
            {isCreate ? "Create your club account" : "University of Minnesota — x500"}
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12, position:"relative" }}>
          {isCreate && (
            <input placeholder="Your Full Name" value={name} onChange={e=>{setName(e.target.value);setError("")}} style={inputStyle}
              onFocus={e=>{e.target.style.borderColor="rgba(255,204,51,.6)";e.target.style.boxShadow="inset 0 2px 8px rgba(60,0,10,.15), 0 0 12px rgba(255,204,51,.15)"}}
              onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.35)";e.target.style.boxShadow="inset 0 2px 8px rgba(60,0,10,.15)"}}
            />
          )}
          <input placeholder="x500 Username" value={x500} onChange={e=>{setX500(e.target.value);setError("")}} style={inputStyle}
            onFocus={e=>{e.target.style.borderColor="rgba(255,204,51,.6)";e.target.style.boxShadow="inset 0 2px 8px rgba(60,0,10,.15), 0 0 12px rgba(255,204,51,.15)"}}
            onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.35)";e.target.style.boxShadow="inset 0 2px 8px rgba(60,0,10,.15)"}}
          />
          <input placeholder="Password" type="password" value={pass} onChange={e=>{setPass(e.target.value);setError("")}} style={inputStyle}
            onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
            onFocus={e=>{e.target.style.borderColor="rgba(255,204,51,.6)";e.target.style.boxShadow="inset 0 2px 8px rgba(60,0,10,.15), 0 0 12px rgba(255,204,51,.15)"}}
            onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,.35)";e.target.style.boxShadow="inset 0 2px 8px rgba(60,0,10,.15)"}}
          />

          {isCreate && (
            <div style={{ marginTop:4 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <label style={{ display:"block", fontFamily:G.ff, color:G.gold, fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".05em" }}>Choose an Avatar</label>
                <button onClick={() => fileRef.current?.click()} style={{ background:"none", border:"none", color:G.gold, fontSize:11, fontFamily:G.ff, cursor:"pointer", textDecoration:"underline", opacity:.8 }}>Upload Custom</button>
                <input type="file" ref={fileRef} style={{ display:"none" }} accept="image/*" onChange={handleFileSelect} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
                {DEFAULT_AVATARS.map((av, idx) => (
                  <div key={idx} onClick={()=>setAvatar(av)} style={{
                    width:"100%", aspectRatio:"1/1", cursor:"pointer", borderRadius:10, overflow:"hidden",
                    border: avatar===av ? `2.5px solid ${G.gold}` : "2.5px solid rgba(255,255,255,.1)",
                    boxShadow: avatar===av ? G.glowGold : "none",
                    transition:"all .15s ease",
                    background:"rgba(0,0,0,.2)"
                  }}>
                    <img src={av} alt={`Avatar ${idx+1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p style={{ fontFamily:G.ff, color:"#ff8888", fontSize:12, margin:"4px 0", textAlign:"center", background:"rgba(255,0,0,.08)", padding:"6px 12px", borderRadius:6, border:"1px solid rgba(255,80,80,.15)" }}>{error}</p>}

          <button onClick={handleSubmit} style={{
            ...G.btn, padding:"12px", fontSize:15, color:"#3a0008", marginTop:8, width:"100%",
          }}>
            {isCreate ? "Create Account" : "Sign In"}
          </button>

          <div style={{ textAlign:"center", marginTop:8 }}>
            <button onClick={()=>{setIsCreate(!isCreate);setError("")}} style={{ background:"none", border:"none", color:G.gold, fontSize:13, fontFamily:G.ff, cursor:"pointer", textDecoration:"underline", opacity:.8 }}>
              {isCreate ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>

          {!isCreate && (
            <p style={{ textAlign:"center", color:"rgba(255,215,175,.4)", fontSize:11, fontFamily:G.ff, margin:0 }}>
              Hint: try username <strong style={{color:"rgba(255,225,155,.75)"}}>demo</strong> / password <strong style={{color:"rgba(255,225,155,.75)"}}>demo</strong>
            </p>
          )}
        </div>

        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.15)", color:"rgba(255,255,255,.6)", fontSize:18, cursor:"pointer", borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>×</button>
        <style>{`
          @keyframes modalIn{from{transform:scale(.88) translateY(20px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
          @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
        `}</style>
      </div>
    </div>
  );
}
