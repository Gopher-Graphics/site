import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { G } from "../constants/theme";
import { SEED_MESSAGES } from "../data/mockData";
import { ImageCropper } from "../components/ImageCropper";

export function DashboardPage({ user, projects, onUpload, onUpdateUser, onSignOut }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempRole, setTempRole] = useState(user.role);
  const [tempAvatar, setTempAvatar] = useState(user.avatar);
  const [croppingImg, setCroppingImg] = useState(null);
  const fileRef = useRef(null);

  const myProjects = projects.filter(p => p.author.startsWith(user.name.split(" ")[0]));
  const stats = [
    { label:"Projects Uploaded", value: myProjects.length || 0, icon:"📁" },
    { label:"Channel Messages", value: Object.values(SEED_MESSAGES).flat().filter(m=>m.author===user.name).length, icon:"💬" },
    { label:"Club Rank", value: user.role, icon:"🏅" },
    { label:"Member Since", value:"Fall 2024", icon:"📅" },
  ];

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCroppingImg(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleCropComplete(croppedData) {
    setTempAvatar(croppedData);
    setCroppingImg(null);
  }

  function handleSave() {
    onUpdateUser({ name: tempName, role: tempRole, avatar: tempAvatar });
    setIsEditing(false);
  }

  function handleCancel() {
    setTempName(user.name);
    setTempRole(user.role);
    setTempAvatar(user.avatar);
    setIsEditing(false);
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#fff",
    fontFamily: G.ff,
    fontSize: "14px",
    outline: "none",
    width: "100%",
    marginBottom: "10px"
  };

  return (
    <div style={{ minHeight:"100vh", padding:"clamp(32px,5vw,48px) clamp(16px,4vw,32px) 60px", maxWidth:1000, margin:"0 auto", animation:"fadeUp .6s ease both" }}>
      {croppingImg && (
        <ImageCropper 
          src={croppingImg} 
          onCrop={handleCropComplete} 
          onCancel={() => setCroppingImg(null)} 
          circular={true}
        />
      )}
      {/* Profile header */}
      <div style={{
        ...G.glass, padding:"clamp(20px,4vw,28px) clamp(18px,4vw,32px)", marginBottom:28,
        display:"flex", alignItems:"center", gap: "clamp(14px,3vw,24px)", flexWrap:"wrap",
        backgroundImage:"linear-gradient(135deg, rgba(122,0,25,.22), rgba(180,100,0,.1))",
      }}>
        <div className="shine-bar" />
        
        {/* Avatar Section */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{
            width:"clamp(80px,12vw,100px)", height:"clamp(80px,12vw,100px)", borderRadius:"50%",
            background:"rgba(122,0,25,.45)", border:`3px solid ${G.gold}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:G.glowGold, position:"relative", overflow:"hidden"
          }}>
            <img src={isEditing ? tempAvatar : user.avatar} alt={user.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
          {isEditing && (
            <button 
              onClick={() => fileRef.current?.click()}
              style={{
                position:"absolute", bottom:0, right:0, 
                background:G.gold, border:"none", borderRadius:"50%", 
                width:30, height:30, cursor:"pointer", display:"flex", 
                alignItems:"center", justifyContent:"center", fontSize:14,
                boxShadow:"0 2px 8px rgba(0,0,0,0.3)"
              }}
            >📷</button>
          )}
          <input type="file" ref={fileRef} style={{ display:"none" }} accept="image/*" onChange={handleFileSelect} />
        </div>

        {/* Info Section */}
        <div style={{ flex:1, minWidth:0 }}>
          {isEditing ? (
            <div style={{ animation:"fadeIn .3s ease" }}>
              <input 
                style={inputStyle} 
                value={tempName} 
                onChange={e => setTempName(e.target.value)} 
                placeholder="Full Name"
              />
              <input 
                style={inputStyle} 
                value={tempRole} 
                onChange={e => setTempRole(e.target.value)} 
                placeholder="Role (e.g. Member, President)"
              />
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily:G.ff, color:"#fff", margin:"0 0 4px", fontSize:"clamp(24px,4vw,32px)", fontWeight:700, textShadow:"0 2px 16px rgba(255,204,51,.3)" }}>{user.name}</h1>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ background:"rgba(122,0,25,.35)", border:"1px solid rgba(255,204,51,.3)", borderRadius:20, padding:"3px 14px", fontFamily:G.ff, color:G.gold, fontSize:13 }}>{user.role}</span>
                <span style={{ fontFamily:G.ff, color:"rgba(255,210,170,.45)", fontSize:13 }}>@{user.x500} · UMN Gopher Graphics</span>
              </div>
            </>
          )}
        </div>

        {/* Buttons Section */}
        <div style={{ display:"flex", gap:10, width: "100%", justifyContent: "flex-end", marginTop: 10 }}>
          {isEditing ? (
            <>
              <button onClick={handleSave} style={{ ...G.btn, padding:"9px 24px", fontSize:13, color:"#3a0008" }}>Save Changes</button>
              <button onClick={handleCancel} style={{ 
                ...G.btn, padding:"9px 24px", fontSize:13, color:"#fff",
                background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)"
              }}>Cancel</button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                style={{ ...G.btn, padding:"9px 24px", fontSize:13, color:"#3a0008" }}
              >✏️ Edit Profile</button>
              <button 
                onClick={onSignOut}
                style={{ 
                  ...G.btn, padding:"9px 24px", fontSize:13, color:"#fff",
                  background:"rgba(122,0,25,0.4)", border:"1.5px solid rgba(255,204,51,0.4)"
                }}
              >🚪 Sign Out</button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(clamp(140px,25vw,200px),1fr))", gap:16, marginBottom:28 }}>
        {stats.map((s,i) => (
          <div key={i} style={{
            ...G.glassCard, padding:"20px 22px", textAlign:"center",
            transition:"transform .2s ease, box-shadow .2s ease",
          }}
            onMouseOver={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`${G.glassCard.boxShadow},${G.glowGold}`}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=G.glassCard.boxShadow}}
          >
            <div className="shine-bar" />
            <div style={{ fontSize:28, marginBottom:8, position:"relative" }}>{s.icon}</div>
            <div style={{ fontFamily:G.ff, color:G.gold, fontSize:"clamp(18px,3vw,22px)", fontWeight:700, marginBottom:4, position:"relative" }}>{s.value}</div>
            <div style={{ fontFamily:G.ff, color:"rgba(255,215,180,.55)", fontSize:12, position:"relative" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* My projects */}
      <div style={{ ...G.glass, padding:"clamp(18px,3vw,24px) clamp(18px,3vw,28px)", marginBottom:24 }}>
        <div className="shine-bar" />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10, position:"relative" }}>
          <h2 style={{ fontFamily:G.ff, color:G.gold, margin:0, fontSize:18 }}>📁 My Projects</h2>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onUpload} style={{ ...G.btn, padding:"7px 18px", fontSize:12, color:"#3a0008" }}>+ New Project</button>
            <button onClick={()=>navigate("/projects")} style={{ ...G.btn, padding:"7px 18px", fontSize:12, color:"#3a0008" }}>Browse All</button>
          </div>
        </div>
        {myProjects.length > 0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:12, position:"relative" }}>
            {myProjects.map(p => (
              <div key={p.id} style={{
                display:"flex", alignItems:"center", gap: "clamp(10px,2vw,16px)",
                padding:"14px 16px", background:"rgba(255,255,255,.05)",
                border:"1px solid rgba(255,204,51,.1)", borderRadius:12,
                transition:"all .18s ease",
              }}
                onMouseOver={e=>{e.currentTarget.style.background="rgba(255,204,51,.08)";e.currentTarget.style.borderColor="rgba(255,204,51,.25)"}}
                onMouseOut={e=>{e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.borderColor="rgba(255,204,51,.1)"}}
              >
                {p.images && p.images.length > 0 ? (
                  <div style={{ width:48, height:48, borderRadius:8, overflow:"hidden", flexShrink:0, border:"1px solid rgba(255,204,51,.2)" }}>
                    <img src={p.images[0]} alt={p.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                ) : (
                  <span style={{ fontSize:32 }}>{p.img}</span>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:G.ff, color:"#fff", fontSize:14, fontWeight:700 }}>{p.title}</div>
                  <div style={{ fontFamily:G.ff, color:"rgba(255,215,175,.5)", fontSize:12, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.desc}</div>
                </div>
                <span style={{ fontFamily:G.ff, color:"rgba(255,210,170,.35)", fontSize:11, flexShrink:0 }}>{p.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"28px 0", position:"relative" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🚀</div>
            <p style={{ fontFamily:G.ff, color:"rgba(255,215,175,.5)", margin:"0 0 16px", fontSize:14 }}>You haven't uploaded any projects yet.</p>
            <button onClick={onUpload} style={{ ...G.btn, padding:"9px 22px", fontSize:13, color:"#3a0008" }}>Upload Your First Project</button>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(clamp(180px,35vw,280px),1fr))", gap:16 }}>
        {[
          { page:"messages", icon:"💬", title:"Open Messages", sub:"Chat with fellow Gophers" },
          { page:"projects", icon:"🖥️", title:"Project Gallery", sub:"Browse all member work" },
        ].map((card,i) => (
          <div key={i} onClick={()=>navigate("/" + card.page)} style={{
            ...G.glassCard, padding:"20px 22px", cursor:"pointer",
            transition:"transform .2s ease, box-shadow .2s ease",
          }}
            onMouseOver={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`${G.glassCard.boxShadow},${G.glowGold}`}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=G.glassCard.boxShadow}}
          >
            <div className="shine-bar" />
            <div style={{ fontSize:26, marginBottom:8, position:"relative" }}>{card.icon}</div>
            <div style={{ fontFamily:G.ff, color:"#fff", fontSize:15, fontWeight:700, marginBottom:4, position:"relative" }}>{card.title}</div>
            <div style={{ fontFamily:G.ff, color:"rgba(255,215,175,.5)", fontSize:12, position:"relative" }}>{card.sub}</div>
          </div>
        ))}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
