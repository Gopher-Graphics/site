import { useState, useRef, ChangeEvent } from "react";
import { ImageCropper } from "./ImageCropper";
import { User } from "../types";

import avatar1 from "../assets/avatars/1.jpeg";
import avatar2 from "../assets/avatars/2.jpeg";
import avatar3 from "../assets/avatars/3.jpeg";
import avatar4 from "../assets/avatars/4.jpeg";
import avatar5 from "../assets/avatars/5.jpeg";
import avatar6 from "../assets/avatars/6.jpeg";
import avatar7 from "../assets/avatars/7.jpeg";
import avatar8 from "../assets/avatars/8.jpeg";

const DEFAULT_AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8];

interface LoginModalProps {
  onClose: () => void;
  onLogin: (_user: User) => void;
  onCreateAccount: (_user: User) => void;
  users: User[];
}

export function LoginModal({ onClose, onLogin, onCreateAccount, users }: LoginModalProps) {
  const [isCreate, setIsCreate]       = useState(false);
  const [x500, setX500]               = useState("");
  const [pass, setPass]               = useState("");
  const [name, setName]               = useState("");
  const [avatar, setAvatar]           = useState(avatar7);
  const [error, setError]             = useState("");
  const [shaking, setShaking]         = useState(false);
  const [croppingImg, setCroppingImg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function triggerShake() { setShaking(true); setTimeout(() => setShaking(false), 500); }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setCroppingImg(result);
        setError("");
      }
    };
    reader.readAsDataURL(file);
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
    <div className="modal-overlay" onClick={onClose}>
      {croppingImg && (
        <ImageCropper key={croppingImg} src={croppingImg} onCrop={(d: string) => { setAvatar(d); setCroppingImg(null); }} onCancel={() => setCroppingImg(null)} circular />
      )}
      <div className="glass w-[min(400px,92vw)] px-[clamp(20px,5vw,32px)] py-9 relative"
        style={{ backgroundImage:"linear-gradient(168deg, rgba(255,255,255,.2) 0%, rgba(255,255,255,.08) 40%, rgba(122,0,25,.08) 100%)", animation: shaking ? "shake .4s ease" : "modalIn .22s cubic-bezier(.34,1.56,.64,1)" }}
        onClick={e => e.stopPropagation()}>
        <div className="shine-bar" style={{ borderRadius:18 }} />

        {/* Header */}
        <div className="text-center mb-6 relative">
          {isCreate ? (
            <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden"
              style={{ border:"3px solid #FFCC33", boxShadow:"0 0 20px rgba(255,204,51,0.3)", background:"rgba(122,0,25,.45)" }}>
              <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="text-[40px] mb-2" style={{ filter:"drop-shadow(0 2px 12px rgba(255,204,51,.3))" }}>🦫</div>
          )}
          <h2 className="font-ui text-white m-0 text-[22px] font-bold" style={{ textShadow:"0 2px 16px rgba(255,204,51,.4)" }}>
            {isCreate ? "Join Gopher Graphics" : "Member Login"}
          </h2>
          <p className="font-ui text-[13px] mt-1.5" style={{ color:"rgba(255,225,195,.6)" }}>
            {isCreate ? "Create your club account" : "University of Minnesota — x500"}
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3 relative">
          {isCreate && (
            <input className="input-glass" placeholder="Your Full Name" value={name}
              onChange={e => { setName(e.target.value); setError(""); }} />
          )}
          <input className="input-glass" placeholder="x500 Username" value={x500}
            onChange={e => { setX500(e.target.value); setError(""); }} />
          <input className="input-glass" type="password" placeholder="Password" value={pass}
            onChange={e => { setPass(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />

          {isCreate && (
            <div className="mt-1">
              <div className="flex justify-between items-center mb-2">
                <label className="label-gold m-0">Choose an Avatar</label>
                <button onClick={() => fileRef.current?.click()} className="text-gold text-[11px] font-ui underline opacity-80">Upload Custom</button>
                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <div key={idx} onClick={() => setAvatar(av)}
                    className="aspect-square cursor-pointer rounded-[10px] overflow-hidden transition-all duration-150"
                    style={{ border: avatar === av ? "2.5px solid #FFCC33" : "2.5px solid rgba(255,255,255,.1)", boxShadow: avatar === av ? "0 0 20px rgba(255,204,51,0.3)" : "none", background:"rgba(0,0,0,.2)" }}>
                    <img src={av} alt={`Avatar ${idx+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="font-ui text-[#ff8888] text-[12px] my-1 text-center px-3 py-1.5 rounded-md" style={{ background:"rgba(255,0,0,.08)", border:"1px solid rgba(255,80,80,.15)" }}>{error}</p>
          )}

          <button onClick={handleSubmit} className="btn-vista w-full py-3 text-[15px] text-[#3a0008] mt-2">
            {isCreate ? "Create Account" : "Sign In"}
          </button>

          <div className="text-center mt-2">
            <button onClick={() => { setIsCreate(!isCreate); setError(""); }} className="text-gold text-[13px] font-ui underline opacity-80">
              {isCreate ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>

          {!isCreate && (
            <p className="text-center text-[11px] font-ui m-0" style={{ color:"rgba(255,215,175,.4)" }}>
              Hint: try username <strong style={{ color:"rgba(255,225,155,.75)" }}>demo</strong> / password <strong style={{ color:"rgba(255,225,155,.75)" }}>demo</strong>
            </p>
          )}
        </div>

        <button onClick={onClose}
          className="absolute top-3.5 right-4 w-[30px] h-[30px] rounded-full flex items-center justify-center text-lg leading-none"
          style={{ background:"rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.15)", color:"rgba(255,255,255,.6)" }}>×</button>
      </div>
    </div>
  );
}
