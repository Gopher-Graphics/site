import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function Nav({ user, onSignIn, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.substring(1) || "home";

  const publicLinks = ["home", "projects", "about"];
  const memberLinks = user ? ["messages", "dashboard"] : [];
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

  const linkLabel = (l) => l === "messages" ? "Messages" : l === "dashboard" ? "Dashboard" : l;

  const activeLinkClass = "btn-vista px-[18px] py-[7px] text-[13px] text-[#3a0008] capitalize";
  const inactiveLinkClass = "btn-vista px-[18px] py-[7px] text-[13px] text-[rgba(80,20,0,0.85)] capitalize";

  // Mobile nav
  if (isMobile) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 py-3"
          style={{ background:"linear-gradient(180deg, rgba(40,0,10,0.85), rgba(20,0,5,0.75))", backdropFilter:"blur(24px) saturate(1.8)", WebkitBackdropFilter:"blur(24px) saturate(1.8)", borderBottom:"1px solid rgba(255,255,255,0.2)", boxShadow:"0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.15) inset" }}>
          <div onClick={() => navTo("home")} className="cursor-pointer">
            <span className="font-ui font-bold text-base text-white" style={{ textShadow:"0 1px 12px rgba(255,204,51,.5)" }}>Gopher Graphics</span>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-lg px-2.5 py-1.5 rounded-lg"
            style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.25)" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </nav>

        {menuOpen && (
          <div className="fixed top-[52px] inset-x-0 bottom-0 z-[99] flex flex-col gap-2 px-4 pt-5"
            style={{ background:"linear-gradient(180deg, rgba(30,0,8,0.95), rgba(15,0,4,0.98))", backdropFilter:"blur(30px)", WebkitBackdropFilter:"blur(30px)", animation:"fadeUp .2s ease both" }}>
            {[...publicLinks, ...memberLinks].map(l => (
              <button key={l} onClick={() => navTo(l)}
                className={`${currentPath === l ? activeLinkClass : inactiveLinkClass} w-full text-center py-2.5 text-sm`}>
                {linkLabel(l)}
              </button>
            ))}
            <div className="h-px my-2" style={{ background:"linear-gradient(90deg, transparent, rgba(255,204,51,.3), transparent)" }} />
            {user ? (
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                style={{ background:"rgba(255,204,51,.1)", border:"1px solid rgba(255,204,51,.25)" }}>
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ border:"1px solid rgba(255,204,51,0.4)" }}>
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-ui text-gold text-sm font-semibold">{user.name}</span>
              </div>
            ) : (
              <button onClick={() => { onSignIn(); setMenuOpen(false); }}
                className="btn-vista w-full py-2.5 text-sm text-[#3a0008]">Sign In</button>
            )}
          </div>
        )}
      </>
    );
  }

  // Desktop nav
  return (
    <div className="sticky top-0 z-[100] flex justify-center px-4 pt-[18px]">
      <nav className="glass flex items-center gap-2 flex-wrap px-3.5 py-2"
        style={{ borderRadius:"40px", boxShadow:"0 8px 48px rgba(80,0,15,.35), 0 1.5px 0 rgba(255,255,255,.7) inset, 0 -1px 0 rgba(255,204,51,.1) inset" }}>
        <div className="shine-bar" style={{ borderRadius:"40px" }} />

        {/* Logo */}
        <div onClick={() => navTo("home")}
          className="flex items-center gap-2 cursor-pointer pr-3.5 mr-2 relative z-10"
          style={{ borderRight:"1px solid rgba(255,204,51,.25)" }}>
          <span className="font-ui font-bold text-[15px] text-white tracking-wide" style={{ textShadow:"0 1px 12px rgba(255,204,51,.5)" }}>Gopher Graphics</span>
        </div>

        {/* Public links */}
        {publicLinks.map(l => (
          <button key={l} onClick={() => navTo(l)}
            className={`${currentPath === l ? activeLinkClass : inactiveLinkClass} relative z-10`}>
            {l}
          </button>
        ))}

        {/* Member links */}
        {memberLinks.map(l => (
          <button key={l} onClick={() => navTo(l)}
            className={`${currentPath === l ? activeLinkClass : inactiveLinkClass} relative z-10`}>
            {linkLabel(l)}
          </button>
        ))}

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-2 ml-1 relative z-10">
            <div className="flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full"
              style={{ background:"rgba(255,204,51,.12)", border:"1px solid rgba(255,204,51,.3)" }}>
              <div className="w-6 h-6 rounded-full overflow-hidden" style={{ border:"1px solid rgba(255,204,51,0.2)" }}>
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <span className="font-ui text-gold text-[13px] font-semibold">{user.name.split(" ")[0]}</span>
            </div>
          </div>
        ) : (
          <button onClick={onSignIn}
            className="btn-vista px-5 py-[7px] text-[13px] text-[#3a0008] ml-1 relative z-10">Sign In</button>
        )}
      </nav>
    </div>
  );
}
