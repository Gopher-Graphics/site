import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { login, signup } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { DEFAULT_AVATARS, defaultSignupAvatar } from "../constants/defaultAvatars";
import logo from "../assets/logo.png";

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { refreshUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const [isCreate, setIsCreate]       = useState(false);
  const [usernameRaw, setUsernameRaw] = useState("");
  const [pass, setPass]               = useState("");
  const [name, setName]               = useState("");
  const [avatar, setAvatar]           = useState(defaultSignupAvatar);
  const [error, setError]             = useState("");
  const [shaking, setShaking]         = useState(false);
  const [isLoading, setIsLoading]     = useState(false);

  if (!mounted) return null;

  function triggerShake() { setShaking(true); setTimeout(() => setShaking(false), 500); }

  async function handleSubmit() {
    setError("");
    if (isCreate) {
      if (!name.trim() || !usernameRaw.trim() || !pass.trim()) { setError("Please fill all fields"); triggerShake(); return; }
    } else {
      if (!usernameRaw.trim() || !pass.trim()) { setError("Please enter username and password"); triggerShake(); return; }
    }

    setIsLoading(true);
    try {
      if (isCreate) {
        await signup(usernameRaw.trim(), pass, name.trim(), avatar);
      } else {
        await login(usernameRaw.trim(), pass);
      }
      await refreshUser();
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
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
            <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden"
              style={{ border:"3px solid #FFCC33", boxShadow:"0 0 20px rgba(255,204,51,0.3)", background:"rgba(122,0,25,.45)" }}>
              <img src={logo} alt="Gopher Graphics Logo" className="w-full h-full object-contain" />
            </div>
          )}
          <h2 className="font-ui text-white m-0 text-[22px] font-bold" style={{ textShadow:"0 2px 16px rgba(255,204,51,.4)" }}>
            {isCreate ? "Join Gopher Graphics" : "Member Login"}
          </h2>
          <p className="font-ui text-[13px] mt-1.5" style={{ color:"rgba(255,225,195,.6)" }}>
            {isCreate ? "Create your club account" : "Sign in to your account"}
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3 relative">
          {isCreate && (
            <input className="input-glass" placeholder="Your Full Name" value={name} disabled={isLoading}
              onChange={e => { setName(e.target.value); setError(""); }} />
          )}
          <input className="input-glass" placeholder="Username (x500)" value={usernameRaw} disabled={isLoading}
            onChange={e => { setUsernameRaw(e.target.value); setError(""); }} />
          <input className="input-glass" type="password" placeholder="Password" value={pass} disabled={isLoading}
            onChange={e => { setPass(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />

          {isCreate && (
            <div className="mt-1">
              <label className="label-gold m-0 mb-2 block">Choose an Avatar</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <div key={idx} onClick={() => setAvatar(av)}
                    className={`aspect-square cursor-pointer rounded-[10px] overflow-hidden transition-all duration-150 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
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

          <button onClick={handleSubmit} disabled={isLoading} className={`btn-vista w-full py-3 text-[15px] text-[#3a0008] mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {isLoading ? "Please wait..." : isCreate ? "Create Account" : "Sign In"}
          </button>

          <div className="text-center mt-2">
            <button onClick={() => { setIsCreate(!isCreate); setError(""); }} className="text-gold text-[13px] font-ui underline opacity-80" disabled={isLoading}>
              {isCreate ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </div>

        <button onClick={onClose}
          className="absolute top-3.5 right-4 w-[30px] h-[30px] rounded-full flex items-center justify-center text-lg leading-none"
          style={{ background:"rgba(0,0,0,.2)", border:"1px solid rgba(255,255,255,.15)", color:"rgba(255,255,255,.6)" }}>×</button>
      </div>
    </div>,
    document.body
  );
}
