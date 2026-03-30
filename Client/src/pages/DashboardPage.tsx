import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SEED_MESSAGES } from "../data/mockData";
import { ImageCropper } from "../components/ImageCropper";
import { User, Project } from "../types";

interface DashboardPageProps {
  user: User;
  projects: Project[];
  onUpload: () => void;
  onUpdateUser: (_userData: Partial<User>) => void;
  onSignOut: () => void;
  onDeleteProject: (_id: number) => void;
}

export function DashboardPage({ user, projects, onUpload, onUpdateUser, onSignOut, onDeleteProject }: DashboardPageProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [tempName, setTempName] = useState(user.name);
  const [tempRole, setTempRole] = useState(user.role);
  const [tempAvatar, setTempAvatar] = useState(user.avatar);
  const [croppingImg, setCroppingImg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const myProjects = projects.filter(p => p.author.startsWith(user.name.split(" ")[0]));
  const stats = [
    { label:"Projects Uploaded", value: myProjects.length || 0, icon:"PROJ" },
    { label:"Channel Messages",  value: Object.values(SEED_MESSAGES).flat().filter(m => m.author === user.name).length, icon:"MSG" },
    { label:"Club Rank",         value: user.role, icon:"RANK" },
    { label:"Member Since",      value: "Fall 2024", icon:"DATE" },
  ];

  const quickLinks = [
    { page:"messages", icon:"MSG", title:"Open Messages",  sub:"Chat with fellow Gophers" },
    { page:"projects", icon:"GFX", title:"Project Gallery", sub:"Browse all member work" },
  ];

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setCroppingImg(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSave() { onUpdateUser({ name: tempName, role: tempRole, avatar: tempAvatar }); setIsEditing(false); }
  function handleCancel() { setTempName(user.name); setTempRole(user.role); setTempAvatar(user.avatar); setIsEditing(false); }

  return (
    <div className="min-h-screen max-w-[1000px] mx-auto px-[clamp(16px,4vw,32px)] pt-[clamp(32px,5vw,48px)] pb-16 animate-[fadeUp_.6s_ease_both]">
      {croppingImg && (
        <ImageCropper key={croppingImg} src={croppingImg} onCrop={d => { setTempAvatar(d); setCroppingImg(null); }} onCancel={() => setCroppingImg(null)} circular />
      )}

      {/* Profile header */}
      <div className="glass flex items-center gap-[clamp(14px,3vw,24px)] flex-wrap mb-7 p-[clamp(20px,4vw,28px)]"
        style={{ backgroundImage:"linear-gradient(135deg, rgba(122,0,25,.22), rgba(180,100,0,.1))" }}>
        <div className="shine-bar" />

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="rounded-full flex items-center justify-center overflow-hidden"
            style={{ width:"clamp(80px,12vw,100px)", height:"clamp(80px,12vw,100px)", background:"rgba(122,0,25,.45)", border:"3px solid #FFCC33", boxShadow:"0 0 20px rgba(255,204,51,0.3)" }}>
            <img src={isEditing ? tempAvatar : user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          {isEditing && (
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm"
              style={{ background:"#FFCC33", boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>
              Edit
            </button>
          )}
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="animate-[fadeUp_.3s_ease] flex flex-col gap-2.5">
              <input className="input-glass" value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Full Name" />
              <input className="input-glass" value={tempRole} onChange={e => setTempRole(e.target.value)} placeholder="Role (e.g. Member, President)" />
            </div>
          ) : (
            <>
              <h1 className="font-ui font-bold text-white mb-1" style={{ fontSize:"clamp(24px,4vw,32px)", textShadow:"0 2px 16px rgba(255,204,51,.3)" }}>{user.name}</h1>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-ui text-gold text-[13px] px-3.5 py-0.5 rounded-full" style={{ background:"rgba(122,0,25,.35)", border:"1px solid rgba(255,204,51,.3)" }}>{user.role}</span>
                <span className="font-ui text-[13px]" style={{ color:"rgba(255,210,170,.45)" }}>@{user.x500} · UMN Gopher Graphics</span>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 w-full justify-end mt-2.5">
          {isEditing ? (
            <>
              <button onClick={handleSave}   className="btn-vista px-6 py-2.5 text-[13px] text-[#3a0008]">Save Changes</button>
              <button onClick={handleCancel} className="btn-ghost  px-6 py-2.5 text-[13px]">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-vista px-6 py-2.5 text-[13px] text-[#3a0008]">Edit Profile</button>
              <button onClick={onSignOut}
                className="btn-vista px-6 py-2.5 text-[13px] text-[#3a0008]"
                style={{ background:"rgba(122,0,25,0.4)", border:"1.5px solid rgba(255,204,51,0.4)" }}>
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 mb-7" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(clamp(140px,25vw,200px),1fr))" }}>
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-5 text-center transition-[transform,box-shadow] duration-200"
            onMouseOver={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 6px 32px rgba(80,0,15,0.22),0 1.5px 0 rgba(255,255,255,0.65) inset,0 0 20px rgba(255,204,51,0.3)"; }}
            onMouseOut ={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
            <div className="shine-bar" />
            <div className="icon-badge mb-2 relative">{s.icon}</div>
            <div className="font-ui text-gold font-bold mb-1 relative" style={{ fontSize:"clamp(18px,3vw,22px)" }}>{s.value}</div>
            <div className="font-ui text-[12px] relative" style={{ color:"rgba(255,215,180,.55)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Projects */}
      <div className="glass mb-6 p-[clamp(18px,3vw,24px)]">
        <div className="shine-bar" />
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2.5 relative">
          <h2 className="font-ui text-gold m-0 text-[18px]">My Projects</h2>
          <div className="flex gap-2.5">
            <button onClick={onUpload}                    className="btn-vista px-[18px] py-[7px] text-[12px] text-[#3a0008]">+ New Project</button>
            <button onClick={() => navigate("/projects")} className="btn-vista px-[18px] py-[7px] text-[12px] text-[#3a0008]">Browse All</button>
          </div>
        </div>
        {myProjects.length > 0 ? (
          <div className="flex flex-col gap-3 relative">
            {myProjects.map(p => (
              <div key={p.id} className="group flex items-center gap-[clamp(10px,2vw,16px)] px-4 py-3.5 rounded-xl transition-all duration-[180ms] relative"
                style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,204,51,.1)" }}
                onMouseOver={e => { e.currentTarget.style.background="rgba(255,204,51,.08)"; e.currentTarget.style.borderColor="rgba(255,204,51,.25)"; }}
                onMouseOut ={e => { e.currentTarget.style.background="rgba(255,255,255,.05)"; e.currentTarget.style.borderColor="rgba(255,204,51,.1)"; }}>
                {p.images && p.images.length > 0 ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ border:"1px solid rgba(255,204,51,.2)" }}>
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center font-ui font-bold text-sm"
                    style={{ background:"rgba(122,0,25,.35)", border:"1px solid rgba(255,204,51,.2)", color:"rgba(255,204,51,.6)" }}>
                    {p.title.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-ui text-white text-sm font-bold truncate">{p.title}</div>
                  <div className="font-ui text-[12px] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color:"rgba(255,215,175,.5)" }}>{p.desc}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setProjectToDelete(p); }}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight text-red-400 border border-red-400/30 hover:bg-red-400/10 hover:border-red-400/60 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] flex-shrink-0">
                  Delete
                </button>
                <span className="font-ui text-[11px] flex-shrink-0" style={{ color:"rgba(255,210,170,.35)" }}>{p.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-7 relative">
            <div className="font-ui font-bold text-[36px] mb-3 tracking-widest" style={{ color:"rgba(255,204,51,.4)" }}>NEW</div>
            <p className="font-ui text-[14px] mb-4" style={{ color:"rgba(255,215,175,.5)" }}>You haven't uploaded any projects yet.</p>
            <button onClick={onUpload} className="btn-vista px-[22px] py-2.5 text-[13px] text-[#3a0008]">Upload Your First Project</button>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(clamp(180px,35vw,280px),1fr))" }}>
        {quickLinks.map((card, i) => (
          <div key={i} onClick={() => navigate("/" + card.page)}
            className="glass-card p-5 cursor-pointer transition-[transform,box-shadow] duration-200"
            onMouseOver={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 6px 32px rgba(80,0,15,0.22),0 1.5px 0 rgba(255,255,255,0.65) inset,0 0 20px rgba(255,204,51,0.3)"; }}
            onMouseOut ={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
            <div className="shine-bar" />
            <div className="icon-badge mb-2 relative">{card.icon}</div>
            <div className="font-ui text-white font-bold text-[15px] mb-1 relative">{card.title}</div>
            <div className="font-ui text-[12px] relative" style={{ color:"rgba(255,215,175,.5)" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {projectToDelete && (
        <div className="modal-overlay" onClick={() => setProjectToDelete(null)}>
          <div className="glass w-[min(400px,94vw)] p-6 animate-[modalIn_.2s_ease]" onClick={e => e.stopPropagation()}>
            <h3 className="font-ui text-red-400 m-0 mb-3 text-lg font-bold">Delete Project</h3>
            <p className="font-ui text-white/80 text-[14px] mb-6">Are you sure you want to delete <strong className="text-white">{projectToDelete.title}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 w-full">
              <button onClick={() => setProjectToDelete(null)}
                className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={() => { onDeleteProject(projectToDelete.id); setProjectToDelete(null); }}
                className="btn-vista px-5 py-2.5 text-sm text-white" style={{ background:"rgba(180,0,0,.6)", border:"1.5px solid rgba(255,100,100,.4)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
