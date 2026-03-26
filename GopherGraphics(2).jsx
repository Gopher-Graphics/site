import { useState, useRef, useEffect } from "react";

// ─── Design tokens ───────────────────────────────────────────────
const G = {
  glass: {
    background: "rgba(255,255,255,0.13)",
    backdropFilter: "blur(18px) saturate(1.8)",
    WebkitBackdropFilter: "blur(18px) saturate(1.8)",
    border: "1.5px solid rgba(255,255,255,0.45)",
    boxShadow: "0 8px 32px rgba(122,0,25,0.22), inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,204,51,0.12)",
    borderRadius: "18px",
  },
  btn: {
    background: "linear-gradient(180deg,rgba(255,255,255,.78) 0%,rgba(255,230,140,.5) 48%,rgba(200,140,40,.55) 49%,rgba(255,240,180,.42) 100%)",
    backdropFilter: "blur(8px)",
    border: "1.5px solid rgba(255,255,255,.8)",
    boxShadow: "0 2px 12px rgba(122,0,25,.2),inset 0 1px 0 rgba(255,255,255,.95)",
    borderRadius: "22px",
    cursor: "pointer",
    fontFamily: "'Trebuchet MS',sans-serif",
    fontWeight: "600",
    letterSpacing: "0.03em",
  },
  gold: "#FFCC33",
  maroon: "#7A0019",
  ff: "'Trebuchet MS',sans-serif",
};

// ─── Static data ─────────────────────────────────────────────────
const FAKE_USERS = [
  { x500: "mchen", password: "password", name: "Mia Chen", role: "President", emoji: "👩‍💻" },
  { x500: "jonask", password: "password", name: "Jonas K.", role: "Vice President", emoji: "👨‍🎨" },
  { x500: "priya", password: "password", name: "Priya S.", role: "Projects Lead", emoji: "👩‍🔬" },
  { x500: "liamd", password: "password", name: "Liam D.", role: "Webmaster", emoji: "🧑‍💻" },
  { x500: "sarav", password: "password", name: "Sara V.", role: "Events", emoji: "👩‍🏫" },
  { x500: "devm", password: "password", name: "Dev M.", role: "Member", emoji: "👨‍💼" },
  { x500: "demo", password: "demo", name: "Demo User", role: "Member", emoji: "🦫" },
];

const CHANNELS = [
  { id: "general",    name: "general",         icon: "💬", desc: "General club chat" },
  { id: "shaders",    name: "shaders",          icon: "✨", desc: "GLSL tips and shader showcases" },
  { id: "opengl",     name: "opengl-vulkan",    icon: "🖥️", desc: "Low-level graphics APIs" },
  { id: "resources",  name: "resources",        icon: "📚", desc: "Papers, tutorials, and links" },
  { id: "events",     name: "events",           icon: "📅", desc: "Upcoming meetings and hackathons" },
  { id: "random",     name: "random",           icon: "🎲", desc: "Off-topic fun" },
];

const SEED_MESSAGES = {
  general: [
    { id:1, author:"Mia Chen",  emoji:"👩‍💻", text:"Hey everyone! Reminder that this Thursday's meeting we're doing a live WebGL demo session. Bring your shaders!",         time:"Today 10:02 AM" },
    { id:2, author:"Jonas K.",  emoji:"👨‍🎨", text:"Can't wait. I've been working on a Navier-Stokes sim I want to show off 💧",                                            time:"Today 10:14 AM" },
    { id:3, author:"Priya S.",  emoji:"👩‍🔬", text:"Nice! I'll be there. Also, the project submissions for the spring showcase are open — upload yours to the projects page.", time:"Today 10:31 AM" },
    { id:4, author:"Dev M.",    emoji:"👨‍💼", text:"Quick question — are we doing the ray tracing workshop before or after the IK animation one?",                          time:"Today 11:05 AM" },
    { id:5, author:"Mia Chen",  emoji:"👩‍💻", text:"Ray tracing first, April 10th. IK animation will be April 24th.",                                                       time:"Today 11:08 AM" },
  ],
  shaders: [
    { id:1, author:"Sara V.",  emoji:"👩‍🏫", text:"Just found this amazing breakdown of the SDF union operator with smooth blending. Game changer for sculpting shapes in code.", time:"Yesterday 4:20 PM" },
    { id:2, author:"Jonas K.", emoji:"👨‍🎨", text:"Inigo Quilez's articles are the bible for this stuff. Have you seen his domain repetition trick?",                          time:"Yesterday 4:45 PM" },
    { id:3, author:"Liam D.",  emoji:"🧑‍💻", text:"I ported one of his scenes to WebGPU and the performance difference is wild. Compute shaders >>> fragment shaders for this.", time:"Yesterday 5:10 PM" },
  ],
  opengl: [
    { id:1, author:"Liam D.",  emoji:"🧑‍💻", text:"Does anyone have a clean Vulkan swapchain recreation example? Mine crashes on resize and I can't figure out why.",       time:"Monday 2:00 PM" },
    { id:2, author:"Priya S.", emoji:"👩‍🔬", text:"The vkDeviceWaitIdle call before cleanup is key. Also make sure you're rebuilding the pipeline if the extent changed.",    time:"Monday 2:18 PM" },
    { id:3, author:"Liam D.",  emoji:"🧑‍💻", text:"Oh my god that was it. The extent rebuild. Thank you Priya you legend 🙏",                                               time:"Monday 2:25 PM" },
  ],
  resources: [
    { id:1, author:"Mia Chen",  emoji:"👩‍💻", text:"Pinning this: 'Physically Based Rendering' (PBRT) 4th edition is now free online at pbr-book.org. Required reading.", time:"Mar 18 9:00 AM" },
    { id:2, author:"Sara V.",   emoji:"👩‍🏫", text:"Also 'Real-Time Rendering' 4th ed is phenomenal for rasterization pipelines.",                                          time:"Mar 18 9:30 AM" },
    { id:3, author:"Dev M.",    emoji:"👨‍💼", text:"LearnOpenGL.com is still the best practical tutorial site. Goes from zero to deferred shading.",                         time:"Mar 19 1:00 PM" },
  ],
  events: [
    { id:1, author:"Sara V.",  emoji:"👩‍🏫", text:"📅 Spring Showcase — April 30th, 6 PM, Keller Hall Atrium. Submit your projects before April 25!",  time:"Mar 20 11:00 AM" },
    { id:2, author:"Mia Chen", emoji:"👩‍💻", text:"Also — we have a team entering the SIGGRAPH student research competition. DM me if you want in!",   time:"Mar 20 11:15 AM" },
  ],
  random: [
    { id:1, author:"Jonas K.", emoji:"👨‍🎨", text:"Hot take: a beautifully optimized fragment shader is more satisfying than any high-level engine abstraction.",  time:"Mar 21 3:00 PM" },
    { id:2, author:"Dev M.",   emoji:"👨‍💼", text:"Controversial but I agree. There's something meditative about watching a 2ms draw call you wrote from scratch.",  time:"Mar 21 3:12 PM" },
    { id:3, author:"Priya S.", emoji:"👩‍🔬", text:"Y'all need help 😂 (I also agree)",                                                                              time:"Mar 21 3:15 PM" },
  ],
};

const PROJECTS = [
  { id:1, title:"Ray Tracer in C++", author:"Mia Chen", tags:["C++","Ray Tracing"], img:"🌌", desc:"A full path-tracer with global illumination and material shaders.", date:"Mar 2026", longDesc:"This project implements a fully featured offline path tracer from scratch in C++17. It supports physically-based BRDFs including Lambertian diffuse, GGX microfacet specular, and dielectric transmission. The renderer uses Monte Carlo integration with importance sampling and a BVH acceleration structure for fast ray-triangle intersection. Final renders on a 1080p scene with 2048 samples-per-pixel take around 40 minutes on a modern CPU.", tech:["C++17","BVH Acceleration","Monte Carlo","BRDF","Multi-threading"], github:"github.com/miachen/raytracer", preview:["Global illumination with soft shadows","Caustics through glass spheres","Subsurface scattering on wax candles"] },
  { id:2, title:"WebGL Fluid Sim", author:"Jonas K.", tags:["WebGL","Simulation"], img:"💧", desc:"Real-time Navier-Stokes fluid dynamics running on the GPU.", date:"Feb 2026", longDesc:"A GPU-accelerated 2D fluid simulation running entirely in the browser using WebGL2 fragment shaders. The solver implements the stable fluids method with velocity advection, pressure projection via Jacobi iteration, and vorticity confinement.", tech:["WebGL2","GLSL","Navier-Stokes","Jacobi Solver","JavaScript"], github:"github.com/jonask/webgl-fluid", preview:["Real-time dye injection and mixing","Vortex shedding visualization","Pressure field heatmap overlay"] },
  { id:3, title:"Voxel Engine", author:"Priya S.", tags:["OpenGL","Voxel"], img:"🧱", desc:"Minecraft-inspired voxel renderer with ambient occlusion.", date:"Jan 2026", longDesc:"A chunk-based voxel world renderer built with OpenGL 4.5 and written in Rust. Features greedy mesh generation, pre-computed ambient occlusion, frustum culling, and a custom texture atlas system.", tech:["OpenGL 4.5","Rust","Greedy Meshing","Ambient Occlusion","Perlin Noise"], github:"github.com/priyaS/voxel-rs", preview:["Chunk streaming with LOD","Underground cave networks","Dynamic day/night sky rendering"] },
  { id:4, title:"Procedural Terrain", author:"Liam D.", tags:["GLSL","Procedural"], img:"🏔️", desc:"Infinite terrain generation using layered Perlin noise.", date:"Dec 2025", longDesc:"An infinite procedural terrain system implemented entirely in GLSL compute shaders. Terrain height is generated from 8 octaves of domain-warped Perlin noise, producing realistic mountain ranges, valleys, and coastlines.", tech:["GLSL Compute","Domain Warping","Hydraulic Erosion","Geometry Clipmaps","C++"], github:"github.com/liamd/procterrain", preview:["Domain-warped mountain formations","Hydraulic erosion river valleys","Seamless LOD transitions at 4K"] },
  { id:5, title:"GLSL Shader Gallery", author:"Sara V.", tags:["GLSL","Art"], img:"🎨", desc:"A collection of fragment shaders exploring color and form.", date:"Nov 2025", longDesc:"A curated interactive gallery of 12 real-time fragment shaders. The collection spans SDF raymarching, reaction-diffusion systems, Truchet tiling, and animated Fourier series visualizations.", tech:["GLSL","SDF Raymarching","Reaction-Diffusion","Shadertoy","WebGL"], github:"github.com/sarav/shader-gallery", preview:["SDF raymarched abstract sculptures","Gray-Scott reaction-diffusion patterns","Animated Fourier epicycles"] },
  { id:6, title:"Skeletal Animation", author:"Dev M.", tags:["OpenGL","Animation"], img:"🦴", desc:"Skinned mesh animation with inverse kinematics solver.", date:"Oct 2025", longDesc:"A skeletal animation system supporting the glTF 2.0 format with GPU skinning, blend tree interpolation between animation clips, and a FABRIK-based IK solver for foot placement on uneven terrain.", tech:["OpenGL","glTF 2.0","GPU Skinning","FABRIK IK","Dear ImGui"], github:"github.com/devm/skeletal-anim", preview:["Blend tree animation transitions","FABRIK foot IK on sloped terrain","Real-time bone weight visualization"] },
];

// ─── Shared components ────────────────────────────────────────────
function Orbs() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#1a0005 0%,#3a000d 30%,#2a0008 60%,#120003 100%)" }} />
      {[
        { w:620,h:620,top:"-12%",left:"-10%",c1:"#7A0019",c2:"#aa0022",dur:"18s",delay:"0s" },
        { w:520,h:520,top:"45%", left:"62%", c1:"#FFCC33",c2:"#cc9900",dur:"22s",delay:"-6s" },
        { w:420,h:420,top:"58%", left:"8%",  c1:"#8B0020",c2:"#FFCC33",dur:"26s",delay:"-10s" },
        { w:360,h:360,top:"8%",  left:"56%", c1:"#FFCC33",c2:"#7A0019",dur:"20s",delay:"-3s" },
        { w:260,h:260,top:"28%", left:"32%", c1:"#cc2200",c2:"#ffaa00",dur:"15s",delay:"-8s" },
      ].map((o,i) => (
        <div key={i} style={{
          position:"absolute", width:o.w, height:o.h, top:o.top, left:o.left,
          borderRadius:"50%",
          background:`radial-gradient(circle at 40% 40%,${o.c1}55,${o.c2}28,transparent 70%)`,
          filter:"blur(65px)",
          animation:`orbFloat ${o.dur} ease-in-out infinite alternate`,
          animationDelay:o.delay,
        }} />
      ))}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,204,51,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,204,51,.04) 1px,transparent 1px)", backgroundSize:"48px 48px" }} />
      <style>{`@keyframes orbFloat{0%{transform:translate(0,0) scale(1)}100%{transform:translate(40px,30px) scale(1.12)}}`}</style>
    </div>
  );
}

function Nav({ page, setPage, user, onSignIn, onSignOut }) {
  const publicLinks = ["home","projects","about"];
  const memberLinks = user ? ["messages","dashboard"] : [];
  return (
    <nav style={{
      position:"fixed", top:18, left:"50%", transform:"translateX(-50%)",
      zIndex:100, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
      ...G.glass, borderRadius:"40px", padding:"8px 12px",
      boxShadow:"0 8px 40px rgba(122,0,25,.35),inset 0 1.5px 0 rgba(255,255,255,.65)",
    }}>
      {/* Logo */}
      <div onClick={() => setPage("home")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"4px 12px 4px 4px", marginRight:8, borderRight:"1px solid rgba(255,204,51,.3)" }}>
        <span style={{ fontSize:26 }}>🦫</span>
        <span style={{ fontFamily:G.ff, fontWeight:700, fontSize:15, color:"#fff", textShadow:"0 1px 8px rgba(255,204,51,.5)", letterSpacing:"0.04em" }}>Gopher Graphics</span>
      </div>
      {/* Public links */}
      {publicLinks.map(l => (
        <button key={l} onClick={() => setPage(l)} style={{
          ...G.btn, padding:"7px 18px", fontSize:13,
          color: page===l ? "#3a0008" : "#5a1a00",
          background: page===l
            ? "linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(255,230,140,.75) 48%,rgba(200,140,30,.8) 49%,rgba(255,240,190,.65) 100%)"
            : G.btn.background,
          textTransform:"capitalize", transition:"all .18s ease",
        }}>{l}</button>
      ))}
      {/* Member links */}
      {memberLinks.map(l => (
        <button key={l} onClick={() => setPage(l)} style={{
          ...G.btn, padding:"7px 18px", fontSize:13,
          color: page===l ? "#3a0008" : "#5a1a00",
          background: page===l
            ? "linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(255,230,140,.75) 48%,rgba(200,140,30,.8) 49%,rgba(255,240,190,.65) 100%)"
            : G.btn.background,
          textTransform:"capitalize", transition:"all .18s ease",
        }}>
          {l === "messages" ? "💬 Messages" : "⚡ Dashboard"}
        </button>
      ))}
      {/* Auth button */}
      {user ? (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 14px", background:"rgba(255,204,51,.15)", border:"1px solid rgba(255,204,51,.3)", borderRadius:20 }}>
            <span style={{ fontSize:16 }}>{user.emoji}</span>
            <span style={{ fontFamily:G.ff, color:G.gold, fontSize:13, fontWeight:600 }}>{user.name.split(" ")[0]}</span>
          </div>
          <button onClick={onSignOut} style={{ ...G.btn, padding:"7px 16px", fontSize:12, color:"#3a0008" }}>Sign Out</button>
        </div>
      ) : (
        <button onClick={onSignIn} style={{ ...G.btn, padding:"7px 20px", fontSize:13, color:"#3a0008", marginLeft:4 }}>🔑 Sign In</button>
      )}
    </nav>
  );
}

// ─── Login Modal ──────────────────────────────────────────────────
function LoginModal({ onClose, onLogin }) {
  const [x500, setX500] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const inputStyle = {
    width:"100%", padding:"10px 14px",
    background:"rgba(255,255,255,.18)", border:"1.5px solid rgba(255,255,255,.5)",
    borderRadius:"10px", fontFamily:G.ff, fontSize:14, color:"#fff", outline:"none",
    boxShadow:"inset 0 2px 6px rgba(80,0,10,.15)", boxSizing:"border-box",
  };

  function handleSubmit() {
    const u = FAKE_USERS.find(u => u.x500 === x500.trim() && u.password === pass);
    if (u) { onLogin(u); onClose(); }
    else {
      setError("Invalid x500 or password. Try: demo / demo");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(20,0,5,.6)", backdropFilter:"blur(6px)" }} onClick={onClose}>
      <div style={{
        ...G.glass, width:380, padding:36, position:"relative",
        animation: shaking ? "shake .4s ease" : "modalIn .22s cubic-bezier(.34,1.56,.64,1)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🦫</div>
          <h2 style={{ fontFamily:G.ff, color:"#fff", margin:0, fontSize:22, fontWeight:700, textShadow:"0 2px 12px rgba(255,204,51,.4)" }}>Member Login</h2>
          <p style={{ color:"rgba(255,220,180,.65)", fontSize:13, marginTop:6, fontFamily:G.ff }}>University of Minnesota — x500</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <input placeholder="x500 Username" value={x500} onChange={e=>{setX500(e.target.value);setError("")}} style={inputStyle} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
          <input placeholder="Password" type="password" value={pass} onChange={e=>{setPass(e.target.value);setError("")}} style={inputStyle} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
          {error && <p style={{ fontFamily:G.ff, color:"#ff8888", fontSize:12, margin:0, textAlign:"center" }}>{error}</p>}
          <button onClick={handleSubmit} style={{ ...G.btn, padding:"11px", fontSize:15, color:"#3a0008", marginTop:4, width:"100%", background:"linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(255,230,140,.75) 48%,rgba(190,130,20,.82) 49%,rgba(255,240,190,.68) 100%)" }}>Sign In</button>
          <p style={{ textAlign:"center", color:"rgba(255,210,150,.55)", fontSize:11, fontFamily:G.ff, margin:0 }}>Hint: try username <strong style={{color:"rgba(255,220,140,.8)"}}>demo</strong> / password <strong style={{color:"rgba(255,220,140,.8)"}}>demo</strong></p>
        </div>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", color:"rgba(255,255,255,.5)", fontSize:22, cursor:"pointer" }}>×</button>
        <style>{`
          @keyframes modalIn{from{transform:scale(.88) translateY(20px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
          @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
        `}</style>
      </div>
    </div>
  );
}

// ─── Project Detail Modal ─────────────────────────────────────────
function ProjectDetailModal({ project:p, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(20,0,5,.65)",backdropFilter:"blur(8px)",padding:"24px 16px" }} onClick={onClose}>
      <div style={{ ...G.glass, width:"100%", maxWidth:680, maxHeight:"88vh", overflowY:"auto", position:"relative", animation:"modalIn .25s cubic-bezier(.34,1.46,.64,1)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ height:160, background:"linear-gradient(135deg,rgba(122,0,25,.75),rgba(180,100,0,.45))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:80, position:"relative", overflow:"hidden", borderRadius:"18px 18px 0 0", borderBottom:"1px solid rgba(255,204,51,.22)", flexShrink:0 }}>
          <div style={{ position:"absolute",inset:0,background:"radial-gradient(circle at 30% 50%,rgba(255,204,51,.13),transparent 65%)" }} />
          <div style={{ position:"absolute",top:0,left:0,right:0,height:"48%",background:"linear-gradient(180deg,rgba(255,255,255,.12),transparent)",borderRadius:"18px 18px 0 0" }} />
          <span style={{ position:"relative", filter:"drop-shadow(0 4px 16px rgba(255,204,51,.3))" }}>{p.img}</span>
        </div>
        <div style={{ padding:"28px 32px 32px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:6, flexWrap:"wrap", gap:10 }}>
            <h2 style={{ fontFamily:G.ff, color:"#fff", margin:0, fontSize:26, fontWeight:700, textShadow:"0 2px 12px rgba(255,204,51,.3)" }}>{p.title}</h2>
            <span style={{ fontFamily:G.ff, color:"rgba(255,200,150,.5)", fontSize:13, marginTop:4 }}>{p.date}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22, flexWrap:"wrap" }}>
            <span style={{ fontFamily:G.ff, color:G.gold, fontSize:14, fontWeight:600 }}>by {p.author}</span>
            {p.tags.map(t => <span key={t} style={{ background:"rgba(122,0,25,.35)", border:"1px solid rgba(255,204,51,.35)", borderRadius:"20px", padding:"3px 12px", fontFamily:G.ff, color:"rgba(255,220,140,.95)", fontSize:12 }}>{t}</span>)}
          </div>
          <div style={{ height:1, background:"linear-gradient(90deg,rgba(255,204,51,.4),transparent)", marginBottom:22 }} />
          <p style={{ fontFamily:G.ff, color:"rgba(255,228,205,.85)", fontSize:14.5, lineHeight:1.75, margin:"0 0 26px" }}>{p.longDesc}</p>
          <div style={{ marginBottom:26 }}>
            <h4 style={{ fontFamily:G.ff, color:G.gold, margin:"0 0 12px", fontSize:13, textTransform:"uppercase", letterSpacing:"0.08em", opacity:.85 }}>Tech Stack</h4>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {p.tech.map(t => <span key={t} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.22)", borderRadius:8, padding:"5px 14px", fontFamily:G.ff, color:"rgba(255,235,210,.9)", fontSize:13 }}>{t}</span>)}
            </div>
          </div>
          <div style={{ marginBottom:28 }}>
            <h4 style={{ fontFamily:G.ff, color:G.gold, margin:"0 0 12px", fontSize:13, textTransform:"uppercase", letterSpacing:"0.08em", opacity:.85 }}>Highlights</h4>
            {p.preview.map((item,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,204,51,.12)", borderRadius:10, padding:"10px 16px", marginBottom:8 }}>
                <span style={{ color:G.gold, fontSize:14, flexShrink:0 }}>◆</span>
                <span style={{ fontFamily:G.ff, color:"rgba(255,225,195,.82)", fontSize:13.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <button style={{ ...G.btn, padding:"10px 26px", fontSize:14, color:"#3a0008", background:"linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(255,230,130,.75) 48%,rgba(190,130,15,.82) 49%,rgba(255,240,180,.68) 100%)" }}>🔗 View on GitHub</button>
            <button onClick={onClose} style={{ ...G.btn, padding:"10px 26px", fontSize:14, color:"#fff", background:"rgba(255,255,255,.1)", border:"1.5px solid rgba(255,255,255,.3)" }}>← Back</button>
          </div>
        </div>
        <button onClick={onClose} style={{ position:"absolute",top:14,right:16,background:"rgba(0,0,0,.3)",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.7)",fontSize:18,cursor:"pointer",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        <style>{`@keyframes modalIn{from{transform:scale(.9) translateY(24px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}`}</style>
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────
function HomePage({ setPage }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"120px 24px 60px" }}>
      <div style={{ textAlign:"center", maxWidth:700, animation:"fadeUp .7s ease both" }}>
        <div style={{ fontSize:72, marginBottom:16, filter:"drop-shadow(0 4px 24px rgba(255,204,51,.45))" }}>🦫</div>
        <h1 style={{ fontFamily:G.ff, fontSize:"clamp(36px,6vw,68px)", fontWeight:700, margin:"0 0 10px", color:"#fff", textShadow:"0 2px 32px rgba(255,204,51,.45),0 0 80px rgba(122,0,25,.5)", letterSpacing:"-0.01em", lineHeight:1.1 }}>Gopher Graphics</h1>
        <div style={{ width:80, height:3, margin:"0 auto 18px", background:"linear-gradient(90deg,transparent,#FFCC33,transparent)", borderRadius:2 }} />
        <p style={{ fontFamily:G.ff, fontSize:18, color:"rgba(255,230,200,.85)", marginBottom:36, lineHeight:1.6, textShadow:"0 1px 8px rgba(122,0,25,.4)" }}>
          The Computer Graphics Club at the University of Minnesota.<br />We render, shade, simulate, and create.
        </p>
        <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={()=>setPage("projects")} style={{ ...G.btn, padding:"13px 32px", fontSize:16, color:"#3a0008", background:"linear-gradient(180deg,rgba(255,255,255,.94) 0%,rgba(255,230,130,.78) 48%,rgba(190,130,15,.85) 49%,rgba(255,240,180,.72) 100%)", transition:"transform .15s ease" }} onMouseOver={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseOut={e=>e.currentTarget.style.transform=""}>View Projects →</button>
          <button onClick={()=>setPage("about")} style={{ ...G.btn, padding:"13px 32px", fontSize:16, color:"#fff", background:"rgba(255,255,255,.12)", border:"1.5px solid rgba(255,255,255,.4)", transition:"transform .15s ease" }} onMouseOver={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseOut={e=>e.currentTarget.style.transform=""}>About Us</button>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:20, maxWidth:800, width:"100%", marginTop:72, animation:"fadeUp .85s ease .15s both" }}>
        {[
          { icon:"✨", title:"Weekly Workshops", desc:"Learn shaders, rendering algorithms, and graphics APIs together." },
          { icon:"🖥️", title:"Project Showcases", desc:"Present your work and get feedback from fellow Gophers." },
          { icon:"🏆", title:"Competitions", desc:"Join demoscene competitions and game jams as a team." },
          { icon:"🔗", title:"Industry Connections", desc:"Network with alumni working at studios and tech companies." },
        ].map((f,i) => (
          <div key={i} style={{ ...G.glass, padding:"24px 22px", transition:"transform .2s ease" }} onMouseOver={e=>e.currentTarget.style.transform="translateY(-4px)"} onMouseOut={e=>e.currentTarget.style.transform=""}>
            <div style={{ fontSize:30, marginBottom:10 }}>{f.icon}</div>
            <h3 style={{ fontFamily:G.ff, color:"#fff", margin:"0 0 8px", fontSize:15, fontWeight:700 }}>{f.title}</h3>
            <p style={{ fontFamily:G.ff, color:"rgba(255,220,190,.68)", fontSize:13, margin:0, lineHeight:1.55 }}>{f.desc}</p>
          </div>
        ))}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── Projects Page ────────────────────────────────────────────────
function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const allTags = ["All",...Array.from(new Set(PROJECTS.flatMap(p=>p.tags)))];
  const filtered = filter==="All" ? PROJECTS : PROJECTS.filter(p=>p.tags.includes(filter));
  return (
    <>
    <div style={{ minHeight:"100vh", padding:"110px 32px 60px", maxWidth:1100, margin:"0 auto" }}>
      <div style={{ animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontFamily:G.ff, color:"#fff", fontSize:"clamp(28px,4vw,48px)", fontWeight:700, margin:"0 0 4px", textShadow:"0 2px 20px rgba(255,204,51,.4)" }}>Member Projects</h1>
        <div style={{ width:60, height:3, background:"linear-gradient(90deg,#FFCC33,transparent)", borderRadius:2, marginBottom:10 }} />
        <p style={{ fontFamily:G.ff, color:"rgba(255,220,190,.6)", marginBottom:28, fontSize:15 }}>Work created by Gopher Graphics members</p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:36 }}>
          {allTags.map(t => (
            <button key={t} onClick={()=>setFilter(t)} style={{ ...G.btn, padding:"6px 18px", fontSize:13, color:filter===t?"#3a0008":"rgba(255,220,180,.88)", background:filter===t?"linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(255,230,130,.75) 48%,rgba(190,130,15,.82) 49%,rgba(255,240,180,.68) 100%)":"rgba(255,255,255,.08)", border:filter===t?"1.5px solid rgba(255,255,255,.8)":"1.5px solid rgba(255,255,255,.18)", transition:"all .15s ease" }}>{t}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:22 }}>
          {filtered.map((p,i) => (
            <div key={p.id} onClick={()=>setSelectedProject(p)} style={{ ...G.glass, padding:0, overflow:"hidden", cursor:"pointer", animation:`fadeUp .5s ease ${i*.07}s both`, transition:"transform .2s ease,box-shadow .2s ease" }} onMouseOver={e=>{e.currentTarget.style.transform="translateY(-5px) scale(1.012)";e.currentTarget.style.boxShadow="0 20px 52px rgba(122,0,25,.3),inset 0 1.5px 0 rgba(255,255,255,.75)"}} onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=G.glass.boxShadow}}>
              <div style={{ height:130, background:"linear-gradient(135deg,rgba(122,0,25,.6),rgba(180,100,0,.35))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:56, position:"relative", overflow:"hidden", borderBottom:"1px solid rgba(255,204,51,.18)" }}>
                <div style={{ position:"absolute",inset:0,background:"radial-gradient(circle at 30% 40%,rgba(255,204,51,.1),transparent 60%)" }} />
                {p.img}
              </div>
              <div style={{ padding:"18px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", marginBottom:8 }}>
                  <h3 style={{ fontFamily:G.ff, color:"#fff", margin:0, fontSize:16, fontWeight:700 }}>{p.title}</h3>
                  <span style={{ fontFamily:G.ff, color:"rgba(255,200,150,.45)", fontSize:11 }}>{p.date}</span>
                </div>
                <p style={{ fontFamily:G.ff, color:"rgba(255,220,190,.62)", fontSize:13, margin:"0 0 14px", lineHeight:1.5 }}>{p.desc}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:G.ff, color:"rgba(255,210,160,.72)", fontSize:12 }}>by {p.author}</span>
                  <div style={{ display:"flex", gap:6 }}>
                    {p.tags.map(t=><span key={t} style={{ background:"rgba(122,0,25,.3)", border:"1px solid rgba(255,204,51,.3)", borderRadius:"20px", padding:"2px 10px", fontFamily:G.ff, color:"rgba(255,220,140,.9)", fontSize:11 }}>{t}</span>)}
                  </div>
                </div>
                <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,204,51,.1)", textAlign:"center" }}>
                  <span style={{ fontFamily:G.ff, color:"rgba(255,204,51,.6)", fontSize:12, letterSpacing:"0.04em" }}>View Details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
    {selectedProject && <ProjectDetailModal project={selectedProject} onClose={()=>setSelectedProject(null)} />}
    </>
  );
}

// ─── About Page ───────────────────────────────────────────────────
function AboutPage() {
  const MEMBERS = [
    { name:"Mia Chen", role:"President", emoji:"👩‍💻" },
    { name:"Jonas K.", role:"Vice President", emoji:"👨‍🎨" },
    { name:"Priya S.", role:"Projects Lead", emoji:"👩‍🔬" },
    { name:"Liam D.", role:"Webmaster", emoji:"🧑‍💻" },
    { name:"Sara V.", role:"Events", emoji:"👩‍🏫" },
    { name:"Dev M.", role:"Member", emoji:"👨‍💼" },
  ];
  return (
    <div style={{ minHeight:"100vh", padding:"110px 32px 60px", maxWidth:1000, margin:"0 auto" }}>
      <div style={{ animation:"fadeUp .6s ease both" }}>
        <h1 style={{ fontFamily:G.ff, color:"#fff", fontSize:"clamp(28px,4vw,48px)", fontWeight:700, margin:"0 0 4px", textShadow:"0 2px 20px rgba(255,204,51,.4)" }}>About Us</h1>
        <div style={{ width:60, height:3, background:"linear-gradient(90deg,#FFCC33,transparent)", borderRadius:2, marginBottom:10 }} />
        <p style={{ fontFamily:G.ff, color:"rgba(255,220,190,.6)", marginBottom:36, fontSize:15 }}>Minnesota's home for computer graphics enthusiasts</p>
        <div style={{ ...G.glass, padding:"32px 36px", marginBottom:28, background:"linear-gradient(135deg,rgba(122,0,25,.22),rgba(160,80,0,.1))" }}>
          <h2 style={{ fontFamily:G.ff, color:G.gold, margin:"0 0 14px", fontSize:22 }}>🌟 Our Mission</h2>
          <p style={{ fontFamily:G.ff, color:"rgba(255,228,205,.82)", fontSize:15, lineHeight:1.7, margin:0 }}>Gopher Graphics is a student-run club at the University of Minnesota dedicated to exploring all facets of computer graphics — from real-time rendering and GPU programming to physically-based simulation, digital art, and interactive media. We welcome everyone from curious beginners to seasoned demoscene veterans.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
          {[
            { icon:"📅", title:"Weekly Meetings", info:"Every Thursday, 6:00 PM", sub:"Keller Hall 3-125" },
            { icon:"💬", title:"Discord", info:"discord.gg/gopherGFX", sub:"Always active — ask questions anytime" },
          ].map((item,i) => (
            <div key={i} style={{ ...G.glass, padding:"24px 26px" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{item.icon}</div>
              <h3 style={{ fontFamily:G.ff, color:"#fff", margin:"0 0 6px", fontSize:16 }}>{item.title}</h3>
              <p style={{ fontFamily:G.ff, color:"rgba(255,230,180,.88)", margin:"0 0 4px", fontSize:15, fontWeight:600 }}>{item.info}</p>
              <p style={{ fontFamily:G.ff, color:"rgba(255,210,160,.5)", margin:0, fontSize:12 }}>{item.sub}</p>
            </div>
          ))}
        </div>
        <div style={{ ...G.glass, padding:"28px 30px", marginBottom:28 }}>
          <h2 style={{ fontFamily:G.ff, color:G.gold, margin:"0 0 22px", fontSize:20 }}>👥 Officers & Members</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:14 }}>
            {MEMBERS.map((m,i) => (
              <div key={i} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,204,51,.18)", borderRadius:12, padding:"16px 14px", textAlign:"center", transition:"transform .18s ease" }} onMouseOver={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.background="rgba(255,204,51,.1)"}} onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.background="rgba(255,255,255,.07)"}}>
                <div style={{ fontSize:28, marginBottom:8 }}>{m.emoji}</div>
                <div style={{ fontFamily:G.ff, color:"#fff", fontSize:13, fontWeight:700 }}>{m.name}</div>
                <div style={{ fontFamily:G.ff, color:"rgba(255,204,51,.6)", fontSize:11, marginTop:3 }}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── Messages Page ────────────────────────────────────────────────
function MessagesPage({ user }) {
  const [activeChannel, setActiveChannel] = useState("general");
  const [messagesByChannel, setMessagesByChannel] = useState(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);
  const messages = messagesByChannel[activeChannel] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, activeChannel]);

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const newMsg = {
      id: Date.now(),
      author: user.name,
      emoji: user.emoji,
      text,
      time: "Just now",
      isMe: true,
    };
    setMessagesByChannel(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel]||[]), newMsg] }));
    setDraft("");
  }

  const ch = CHANNELS.find(c=>c.id===activeChannel);

  return (
    <div style={{ height:"100vh", display:"flex", paddingTop:80, boxSizing:"border-box" }}>

      {/* Sidebar */}
      <div style={{ width:240, flexShrink:0, display:"flex", flexDirection:"column", padding:"16px 12px", gap:4, borderRight:"1px solid rgba(255,204,51,.12)", background:"rgba(0,0,0,.18)" }}>
        <div style={{ padding:"8px 10px 16px", marginBottom:4, borderBottom:"1px solid rgba(255,204,51,.12)" }}>
          <div style={{ fontFamily:G.ff, color:G.gold, fontSize:13, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", opacity:.8 }}>Gopher Graphics</div>
          <div style={{ fontFamily:G.ff, color:"rgba(255,210,160,.5)", fontSize:11, marginTop:2 }}>Club Channels</div>
        </div>
        {CHANNELS.map(c => (
          <button key={c.id} onClick={()=>setActiveChannel(c.id)} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"9px 12px", borderRadius:10, border:"none", cursor:"pointer",
            background: activeChannel===c.id ? "rgba(255,204,51,.15)" : "transparent",
            borderLeft: activeChannel===c.id ? `3px solid ${G.gold}` : "3px solid transparent",
            transition:"all .15s ease", textAlign:"left",
          }}>
            <span style={{ fontSize:16 }}>{c.icon}</span>
            <div>
              <div style={{ fontFamily:G.ff, color: activeChannel===c.id ? G.gold : "rgba(255,220,180,.75)", fontSize:13, fontWeight: activeChannel===c.id ? 700 : 400 }}>#{c.name}</div>
            </div>
          </button>
        ))}

        {/* Signed-in user footer */}
        <div style={{ marginTop:"auto", padding:"12px 10px 4px", borderTop:"1px solid rgba(255,204,51,.12)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(122,0,25,.5)", border:"2px solid rgba(255,204,51,.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{user.emoji}</div>
          <div>
            <div style={{ fontFamily:G.ff, color:"#fff", fontSize:13, fontWeight:600 }}>{user.name}</div>
            <div style={{ fontFamily:G.ff, color:G.gold, fontSize:11, opacity:.7 }}>{user.role}</div>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

        {/* Channel header */}
        <div style={{ padding:"14px 24px", borderBottom:"1px solid rgba(255,204,51,.12)", display:"flex", alignItems:"center", gap:12, background:"rgba(0,0,0,.1)", flexShrink:0 }}>
          <span style={{ fontSize:22 }}>{ch?.icon}</span>
          <div>
            <div style={{ fontFamily:G.ff, color:"#fff", fontSize:16, fontWeight:700 }}>#{ch?.name}</div>
            <div style={{ fontFamily:G.ff, color:"rgba(255,210,160,.55)", fontSize:12 }}>{ch?.desc}</div>
          </div>
          <div style={{ marginLeft:"auto", fontFamily:G.ff, color:"rgba(255,200,150,.4)", fontSize:12 }}>{messages.length} messages</div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:4 }}>
          {messages.map((m, i) => {
            const isMe = m.isMe || m.author === user.name;
            const prevSameAuthor = i > 0 && messages[i-1].author === m.author && !messages[i-1].isMe && !m.isMe;
            return (
              <div key={m.id} style={{ display:"flex", gap:12, alignItems:"flex-start", marginTop: prevSameAuthor ? 2 : 14, padding:"6px 10px", borderRadius:10, transition:"background .15s ease" }} onMouseOver={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                {!prevSameAuthor ? (
                  <div style={{ width:38, height:38, borderRadius:"50%", background: isMe ? "rgba(122,0,25,.6)" : "rgba(255,204,51,.15)", border:`2px solid ${isMe?"rgba(255,204,51,.5)":"rgba(255,255,255,.2)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{m.emoji}</div>
                ) : (
                  <div style={{ width:38, flexShrink:0 }} />
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  {!prevSameAuthor && (
                    <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:3 }}>
                      <span style={{ fontFamily:G.ff, color: isMe ? G.gold : "#fff", fontSize:14, fontWeight:700 }}>{m.author}</span>
                      <span style={{ fontFamily:G.ff, color:"rgba(255,200,150,.35)", fontSize:11 }}>{m.time}</span>
                    </div>
                  )}
                  <div style={{ fontFamily:G.ff, color:"rgba(255,230,205,.88)", fontSize:14, lineHeight:1.55, wordBreak:"break-word" }}>{m.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding:"12px 24px 20px", flexShrink:0 }}>
          <div style={{ ...G.glass, display:"flex", alignItems:"center", gap:12, padding:"10px 16px", borderRadius:14 }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(122,0,25,.5)", border:"1.5px solid rgba(255,204,51,.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{user.emoji}</div>
            <input
              value={draft}
              onChange={e=>setDraft(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),sendMessage())}
              placeholder={`Message #${ch?.name}...`}
              style={{ flex:1, background:"transparent", border:"none", outline:"none", fontFamily:G.ff, fontSize:14, color:"#fff", minWidth:0 }}
            />
            <button onClick={sendMessage} style={{ ...G.btn, padding:"7px 18px", fontSize:13, color:"#3a0008", flexShrink:0, background:"linear-gradient(180deg,rgba(255,255,255,.9) 0%,rgba(255,230,130,.72) 48%,rgba(190,130,15,.8) 49%,rgba(255,240,180,.65) 100%)" }}>Send ↵</button>
          </div>
          <p style={{ fontFamily:G.ff, color:"rgba(255,200,150,.3)", fontSize:11, margin:"6px 0 0 16px" }}>Press Enter to send</p>
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar{width:5px}
        div::-webkit-scrollbar-track{background:transparent}
        div::-webkit-scrollbar-thumb{background:rgba(255,204,51,.2);border-radius:3px}
      `}</style>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────
function DashboardPage({ user, setPage }) {
  const myProjects = PROJECTS.filter(p => p.author.startsWith(user.name.split(" ")[0]));
  const stats = [
    { label:"Projects Uploaded", value: myProjects.length || 0, icon:"📁" },
    { label:"Channel Messages", value: Object.values(SEED_MESSAGES).flat().filter(m=>m.author===user.name).length, icon:"💬" },
    { label:"Club Rank", value: user.role, icon:"🏅" },
    { label:"Member Since", value:"Fall 2024", icon:"📅" },
  ];
  return (
    <div style={{ minHeight:"100vh", padding:"110px 32px 60px", maxWidth:1000, margin:"0 auto", animation:"fadeUp .6s ease both" }}>
      {/* Profile header */}
      <div style={{ ...G.glass, padding:"28px 32px", marginBottom:28, display:"flex", alignItems:"center", gap:24, flexWrap:"wrap", background:"linear-gradient(135deg,rgba(122,0,25,.25),rgba(160,80,0,.12))" }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(122,0,25,.5)", border:`3px solid ${G.gold}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:42, flexShrink:0, boxShadow:`0 0 24px rgba(255,204,51,.25)` }}>{user.emoji}</div>
        <div>
          <h1 style={{ fontFamily:G.ff, color:"#fff", margin:"0 0 4px", fontSize:28, fontWeight:700, textShadow:"0 2px 12px rgba(255,204,51,.3)" }}>{user.name}</h1>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <span style={{ background:"rgba(122,0,25,.4)", border:"1px solid rgba(255,204,51,.35)", borderRadius:20, padding:"3px 14px", fontFamily:G.ff, color:G.gold, fontSize:13 }}>{user.role}</span>
            <span style={{ fontFamily:G.ff, color:"rgba(255,200,150,.5)", fontSize:13 }}>@{user.x500} · University of Minnesota</span>
          </div>
        </div>
        <button style={{ ...G.btn, padding:"9px 22px", fontSize:13, color:"#3a0008", marginLeft:"auto", background:"linear-gradient(180deg,rgba(255,255,255,.9) 0%,rgba(255,230,130,.72) 48%,rgba(190,130,15,.8) 49%,rgba(255,240,180,.65) 100%)" }}>✏️ Edit Profile</button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
        {stats.map((s,i) => (
          <div key={i} style={{ ...G.glass, padding:"20px 22px", textAlign:"center" }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontFamily:G.ff, color:G.gold, fontSize:22, fontWeight:700, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontFamily:G.ff, color:"rgba(255,210,170,.6)", fontSize:12 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* My projects */}
      <div style={{ ...G.glass, padding:"24px 28px", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ fontFamily:G.ff, color:G.gold, margin:0, fontSize:18 }}>📁 My Projects</h2>
          <button onClick={()=>setPage("projects")} style={{ ...G.btn, padding:"7px 18px", fontSize:12, color:"#3a0008", background:"linear-gradient(180deg,rgba(255,255,255,.88) 0%,rgba(255,230,130,.7) 48%,rgba(190,130,15,.78) 49%,rgba(255,240,180,.63) 100%)" }}>Browse All</button>
        </div>
        {myProjects.length > 0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {myProjects.map(p => (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 16px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,204,51,.12)", borderRadius:12 }}>
                <span style={{ fontSize:32 }}>{p.img}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:G.ff, color:"#fff", fontSize:14, fontWeight:700 }}>{p.title}</div>
                  <div style={{ fontFamily:G.ff, color:"rgba(255,210,160,.55)", fontSize:12, marginTop:2 }}>{p.desc.slice(0,60)}…</div>
                </div>
                <span style={{ fontFamily:G.ff, color:"rgba(255,200,150,.4)", fontSize:11 }}>{p.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"28px 0" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🚀</div>
            <p style={{ fontFamily:G.ff, color:"rgba(255,210,160,.55)", margin:"0 0 16px", fontSize:14 }}>You haven't uploaded any projects yet.</p>
            <button style={{ ...G.btn, padding:"9px 22px", fontSize:13, color:"#3a0008", background:"linear-gradient(180deg,rgba(255,255,255,.9) 0%,rgba(255,230,130,.72) 48%,rgba(190,130,15,.8) 49%,rgba(255,240,180,.65) 100%)" }}>Upload Your First Project</button>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div onClick={()=>setPage("messages")} style={{ ...G.glass, padding:"20px 22px", cursor:"pointer", transition:"transform .18s ease" }} onMouseOver={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseOut={e=>e.currentTarget.style.transform=""}>
          <div style={{ fontSize:26, marginBottom:8 }}>💬</div>
          <div style={{ fontFamily:G.ff, color:"#fff", fontSize:15, fontWeight:700, marginBottom:4 }}>Open Messages</div>
          <div style={{ fontFamily:G.ff, color:"rgba(255,210,160,.55)", fontSize:12 }}>Chat with fellow Gophers</div>
        </div>
        <div onClick={()=>setPage("projects")} style={{ ...G.glass, padding:"20px 22px", cursor:"pointer", transition:"transform .18s ease" }} onMouseOver={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseOut={e=>e.currentTarget.style.transform=""}>
          <div style={{ fontSize:26, marginBottom:8 }}>🖥️</div>
          <div style={{ fontFamily:G.ff, color:"#fff", fontSize:15, fontWeight:700, marginBottom:4 }}>Project Gallery</div>
          <div style={{ fontFamily:G.ff, color:"rgba(255,210,160,.55)", fontSize:12 }}>Browse all member work</div>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);

  function handleLogin(u) { setUser(u); setPage("dashboard"); }
  function handleSignOut() { setUser(null); setPage("home"); }

  // Redirect member-only pages if not logged in
  const safePage = (!user && (page==="messages"||page==="dashboard")) ? "home" : page;

  return (
    <div style={{ minHeight:"100vh", position:"relative" }}>
      <Orbs />
      <div style={{ position:"relative", zIndex:1 }}>
        <Nav page={safePage} setPage={setPage} user={user} onSignIn={()=>setShowLogin(true)} onSignOut={handleSignOut} />
        {safePage==="home"      && <HomePage setPage={setPage} />}
        {safePage==="projects"  && <ProjectsPage />}
        {safePage==="about"     && <AboutPage />}
        {safePage==="messages"  && user && <MessagesPage user={user} />}
        {safePage==="dashboard" && user && <DashboardPage user={user} setPage={setPage} />}
        {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onLogin={handleLogin} />}
      </div>
    </div>
  );
}
