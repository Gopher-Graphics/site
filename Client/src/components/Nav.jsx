import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { G } from "../constants/theme";

export function Nav({ user, onSignIn, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.substring(1) || "home";
  
  const publicLinks = ["home","projects","about"];
  const memberLinks = user ? ["messages","dashboard"] : [];
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function navTo(p) { 
    if (p === "home") navigate("/");
    else navigate("/" + p);
    setMenuOpen(false); 
  }

  const linkBtn = (l, isActive) => ({
    ...G.btn,
    padding: isMobile ? "10px 20px" : "7px 18px",
    fontSize: isMobile ? 14 : 13,
    color: isActive ? "#3a0008" : "rgba(80,20,0,.85)",
    background: isActive
      ? "linear-gradient(180deg,rgba(255,255,255,.95) 0%,rgba(255,240,180,.8) 46%,rgba(210,155,40,.85) 50%,rgba(255,235,160,.7) 51%,rgba(255,245,200,.58) 100%)"
      : G.btn.background,
    boxShadow: isActive
      ? `${G.btn.boxShadow}, ${G.glowGold}`
      : G.btn.boxShadow,
    textTransform:"capitalize",
    transition:"all .18s ease",
    width: isMobile ? "100%" : "auto",
  });

  // Mobile nav
  if (isMobile) {
    return (
      <>
        <nav style={{
          position:"fixed", top:0, left:0, right:0, zIndex:100,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"12px 16px",
          background:"linear-gradient(180deg, rgba(40,0,10,0.85) 0%, rgba(20,0,5,0.75) 100%)",
          backdropFilter:"blur(24px) saturate(1.8)",
          WebkitBackdropFilter:"blur(24px) saturate(1.8)",
          borderBottom:"1px solid rgba(255,255,255,0.2)",
          boxShadow:"0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.15) inset",
        }}>
          <div onClick={() => navTo("home")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
            <span style={{ fontFamily:G.ff, fontWeight:700, fontSize:16, color:"#fff", textShadow:`0 1px 12px rgba(255,204,51,.5)` }}>Gopher Graphics</span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:8, padding:"6px 10px", color:"#fff", fontSize:18 }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            position:"fixed", top:52, left:0, right:0, bottom:0, zIndex:99,
            background:"linear-gradient(180deg, rgba(30,0,8,0.95) 0%, rgba(15,0,4,0.98) 100%)",
            backdropFilter:"blur(30px)",
            WebkitBackdropFilter:"blur(30px)",
            padding:"20px 16px",
            display:"flex", flexDirection:"column", gap:8,
            animation:"fadeUp .2s ease both",
          }}>
            {publicLinks.map(l => (
              <button key={l} onClick={() => navTo(l)} style={linkBtn(l, currentPath===l)}>{l}</button>
            ))}
            {memberLinks.map(l => (
              <button key={l} onClick={() => navTo(l)} style={linkBtn(l, currentPath===l)}>
                {l === "messages" ? "Messages" : "Dashboard"}
              </button>
            ))}
            <div style={{ height:1, background:"linear-gradient(90deg, transparent, rgba(255,204,51,.3), transparent)", margin:"8px 0" }} />
            {user ? (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"rgba(255,204,51,.1)", border:"1px solid rgba(255,204,51,.25)", borderRadius:12 }}>
                  <div style={{ 
                    width:28, height:28, borderRadius:"50%", overflow:"hidden", 
                    border:"1px solid rgba(255,204,51,0.4)", background:"rgba(0,0,0,0.2)"
                  }}>
                    <img src={user.avatar} alt={user.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                  <span style={{ fontFamily:G.ff, color:G.gold, fontSize:14, fontWeight:600 }}>{user.name}</span>
                </div>
              </div>
            ) : (
              <button onClick={() => { onSignIn(); setMenuOpen(false); }} style={{ ...G.btn, padding:"10px", fontSize:14, color:"#3a0008", width:"100%" }}>🔑 Sign In</button>
            )}
          </div>
        )}
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </>
    );
  }

  // Desktop nav
  return (
    <div style={{ position:"sticky", top:0, zIndex:100, display:"flex", justifyContent:"center", padding:"18px 16px 0" }}>
    <nav style={{
      display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
      ...G.glass,
      borderRadius:"40px", padding:"8px 14px",
      boxShadow:"0 8px 48px rgba(80,0,15,.35), 0 1.5px 0 rgba(255,255,255,.7) inset, 0 -1px 0 rgba(255,204,51,.1) inset",
    }}>
      {/* Vista top shine */}
      <div className="shine-bar" style={{ borderRadius:"40px" }} />

      {/* Logo */}
      <div onClick={() => navTo("home")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"4px 14px 4px 6px", marginRight:8, borderRight:"1px solid rgba(255,204,51,.25)", position:"relative", zIndex:1 }}>
        <span style={{ fontFamily:G.ff, fontWeight:700, fontSize:15, color:"#fff", textShadow:`0 1px 12px rgba(255,204,51,.5)`, letterSpacing:"0.04em" }}>Gopher Graphics</span>
      </div>

      {/* Public links */}
      {publicLinks.map(l => (
        <button key={l} onClick={() => navTo(l)} style={{ ...linkBtn(l, currentPath===l), position:"relative", zIndex:1 }}>{l}</button>
      ))}

      {/* Member links */}
      {memberLinks.map(l => (
        <button key={l} onClick={() => navTo(l)} style={{ ...linkBtn(l, currentPath===l), position:"relative", zIndex:1 }}>
          {l === "messages" ? "Messages" : "Dashboard"}
        </button>
      ))}

      {/* Auth */}
      {user ? (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:4, position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 12px 4px 6px", background:"rgba(255,204,51,.12)", border:"1px solid rgba(255,204,51,.3)", borderRadius:20 }}>
            <div style={{ width:24, height:24, borderRadius:"50%", overflow:"hidden", border:"1px solid rgba(255,204,51,0.2)" }}>
              <img src={user.avatar} alt={user.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
            <span style={{ fontFamily:G.ff, color:G.gold, fontSize:13, fontWeight:600 }}>{user.name.split(" ")[0]}</span>
          </div>
        </div>
      ) : (
        <button onClick={onSignIn} style={{ ...G.btn, padding:"7px 20px", fontSize:13, color:"#3a0008", marginLeft:4, position:"relative", zIndex:1 }}>🔑 Sign In</button>
      )}
    </nav>
    </div>
  );
}
