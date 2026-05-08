import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile, deleteAccount } from "../api/auth";
import { getImageUrl } from "../api/http";
import { compressImage } from "../util/image";
import { getProjects, deleteProject } from "../api/projects";
import { Project } from "../types";
import { DEFAULT_AVATARS, pickDefaultAvatar } from "../constants/defaultAvatars";
import { AssetIcon, type AssetIconName } from "../components/AssetIcon";

interface DashboardPageProps {
  onUpload: () => void;
}

export function DashboardPage({ onUpload }: DashboardPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, refreshUser, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  
  const [tempName, setTempName]               = useState(user?.name || "");
  const [tempAvatar, setTempAvatar]           = useState(() => pickDefaultAvatar(user?.avatar_url));
  const [tempRole, setTempRole]               = useState(user?.role || "");
  const [tempMemberSince, setTempMemberSince] = useState(user?.member_since ? user.member_since.split('T')[0] : "");
  const [tempMajor, setTempMajor]             = useState(user?.major || "");
  const [tempGithub, setTempGithub]           = useState(user?.github_url || "");
  const [tempLinkedin, setTempLinkedin]       = useState(user?.linkedin_url || "");
  const [tempOtherUrl, setTempOtherUrl]       = useState(user?.other_url || "");
  const [tempFavLang, setTempFavLang]         = useState(user?.fav_language || "");
  const [tempFavClass, setTempFavClass]       = useState(user?.fav_class || "");
  const [tempFavProf, setTempFavProf]         = useState(user?.fav_professor || "");
  const [tempFavGame, setTempFavGame]         = useState(user?.fav_game || "");
  const [tempFavTopic, setTempFavTopic]       = useState(user?.fav_graphics_topic || "");
  const [tempLeastFavLang, setTempLeastFavLang] = useState(user?.least_fav_language || "");
  const [tempOS, setTempOS]                   = useState(user?.operating_system || "");
  const [tempSoftware, setTempSoftware]       = useState(user?.graphics_software || "");

  const { data: projectsData } = useQuery({
    queryKey: ["projects", { author: user?.username }],
    queryFn: () => getProjects({ author: user?.username }),
    enabled: !!user?.username,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await refreshUser();
      setIsEditing(false);
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setProjectToDelete(null);
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      logout();
      navigate("/");
    }
  });

  if (!user) return null;

  const myProjects = projectsData?.projects || [];

  const stats: Array<{ label: string; value: string | number; icon: AssetIconName }> = [
    { label:"Projects Uploaded", value: myProjects.length || 0, icon:"project" },
    { label:"Club Rank", value: user.role, icon:"medal" },
    { label:"Member Since", value: user.member_since ? new Date(user.member_since).getFullYear() : "Fall 2024", icon:"star" },
  ];

  const quickLinks: Array<{ page: string; icon: AssetIconName; title: string; sub: string }> = [
    { page:"messages", icon:"mail", title:"Open Messages", sub:"Chat with fellow Gophers" },
    { page:"projects", icon:"project", title:"Project Gallery", sub:"Browse all member work" },
  ];

  function handleSave() {
    updateProfileMutation.mutate({
      name: tempName, avatar_url: tempAvatar,
      role: tempRole, member_since: tempMemberSince,
      major: tempMajor, github_url: tempGithub,
      linkedin_url: tempLinkedin, other_url: tempOtherUrl,
      fav_language: tempFavLang, fav_class: tempFavClass,
      fav_professor: tempFavProf, fav_game: tempFavGame,
      fav_graphics_topic: tempFavTopic, least_fav_language: tempLeastFavLang,
      operating_system: tempOS, graphics_software: tempSoftware,
    });
  }
  
  function handleCancel() {
    setTempName(user!.name); setTempAvatar(pickDefaultAvatar(user!.avatar_url));
    setTempRole(user!.role); setTempMemberSince(user!.member_since ? user!.member_since.split('T')[0] : "");
    setTempMajor(user!.major || ""); setTempGithub(user!.github_url || "");
    setTempLinkedin(user!.linkedin_url || ""); setTempOtherUrl(user!.other_url || "");
    setTempFavLang(user!.fav_language || ""); setTempFavClass(user!.fav_class || "");
    setTempFavProf(user!.fav_professor || ""); setTempFavGame(user!.fav_game || "");
    setTempFavTopic(user!.fav_graphics_topic || ""); setTempLeastFavLang(user!.least_fav_language || "");
    setTempOS(user!.operating_system || ""); setTempSoftware(user!.graphics_software || "");
    setIsEditing(false);
  }

  function startEditing() {
    setTempName(user!.name); setTempAvatar(pickDefaultAvatar(user!.avatar_url));
    setTempRole(user!.role); setTempMemberSince(user!.member_since ? user!.member_since.split('T')[0] : "");
    setTempMajor(user!.major || ""); setTempGithub(user!.github_url || "");
    setTempLinkedin(user!.linkedin_url || ""); setTempOtherUrl(user!.other_url || "");
    setTempFavLang(user!.fav_language || ""); setTempFavClass(user!.fav_class || "");
    setTempFavProf(user!.fav_professor || ""); setTempFavGame(user!.fav_game || "");
    setTempFavTopic(user!.fav_graphics_topic || ""); setTempLeastFavLang(user!.least_fav_language || "");
    setTempOS(user!.operating_system || ""); setTempSoftware(user!.graphics_software || "");
    setIsEditing(true);
  }

  return (
    <div className="min-h-screen max-w-[1000px] mx-auto px-[clamp(16px,4vw,32px)] pt-[clamp(32px,5vw,48px)] pb-16 animate-[fadeUp_.6s_ease_both]">
      {/* Profile header */}
      <div className="glass flex flex-col gap-[clamp(14px,3vw,24px)] mb-7 p-[clamp(20px,4vw,28px)]"
        style={{ backgroundImage:"linear-gradient(135deg, rgba(122,0,25,.22), rgba(180,100,0,.1))" }}>
        <div className="shine-bar" />

        <div className="flex items-center gap-[clamp(14px,3vw,24px)] flex-wrap relative">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="rounded-full flex items-center justify-center overflow-hidden"
            style={{ width:"clamp(80px,12vw,100px)", height:"clamp(80px,12vw,100px)", background:"rgba(122,0,25,.45)", border:"3px solid #FFCC33", boxShadow:"0 0 20px rgba(255,204,51,0.3)" }}>
            <img src={isEditing ? tempAvatar : getImageUrl(pickDefaultAvatar(user.avatar_url))} alt={user.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="animate-[fadeUp_.3s_ease] flex flex-col gap-2.5 max-w-sm">
              <div>
                <label className="label-gold text-[11px] mb-1 block">Full Name</label>
                <input className="input-glass" value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <label className="label-gold text-[11px] mb-1 block">Club Rank</label>
                  <input className="input-glass" value={tempRole} onChange={e => setTempRole(e.target.value)} placeholder="Rank (e.g. Member)" />
                </div>
                <div className="flex-1">
                  <label className="label-gold text-[11px] mb-1 block">Member Since</label>
                  <input className="input-glass" type="date" value={tempMemberSince} onChange={e => setTempMemberSince(e.target.value)} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-ui font-bold text-white mb-1" style={{ fontSize:"clamp(24px,4vw,32px)", textShadow:"0 2px 16px rgba(255,204,51,.3)" }}>{user.name}</h1>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-ui text-gold text-[13px] px-3.5 py-0.5 rounded-full" style={{ background:"rgba(122,0,25,.35)", border:"1px solid rgba(255,204,51,.3)" }}>{user.role}</span>
                <span className="font-ui text-[13px]" style={{ color:"rgba(255,210,170,.45)" }}>@{user.username} · UMN Gopher Graphics</span>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 w-full justify-end mt-2.5">
          {isEditing ? (
            <>
              <button onClick={handleSave} disabled={updateProfileMutation.isPending} className="btn-vista px-6 py-2.5 text-[13px] text-[#3a0008]">
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setShowDeleteAccountConfirm(true)} className="btn-ghost px-6 py-2.5 text-[13px] text-red-400 border-red-400/20">Delete Account</button>
              <button onClick={handleCancel} disabled={updateProfileMutation.isPending} className="btn-ghost  px-6 py-2.5 text-[13px]">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={startEditing} className="btn-vista px-6 py-2.5 text-[13px] text-[#3a0008]">Edit Profile</button>
              <button onClick={logout}
                className="btn-vista px-6 py-2.5 text-[13px] text-white"
                style={{ background:"rgba(122,0,25,0.4)", border:"1.5px solid rgba(255,204,51,0.4)" }}>
                Sign Out
              </button>
            </>
          )}
        </div>
        </div>

        {isEditing && (
          <div className="w-full pt-5 mt-1 border-t relative" style={{ borderColor: "rgba(255,204,51,0.15)" }}>
            <label className="label-gold m-0 mb-2 block">Choose an Avatar</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-w-lg">
              {DEFAULT_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTempAvatar(av)}
                  className="aspect-square cursor-pointer rounded-[10px] overflow-hidden transition-all duration-150 p-0"
                  style={{
                    border: tempAvatar === av ? "2.5px solid #FFCC33" : "2.5px solid rgba(255,255,255,.1)",
                    boxShadow: tempAvatar === av ? "0 0 20px rgba(255,204,51,0.3)" : "none",
                    background: "rgba(0,0,0,.2)",
                  }}
                >
                  <img src={av} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Extended profile edit panel ── */}
        {isEditing && (
          <div className="w-full pt-5 mt-1 border-t relative" style={{ borderColor:"rgba(255,204,51,0.15)" }}>
            {/* Favorites */}
            <p className="label-gold m-0 mb-3 block text-[11px] uppercase tracking-widest">Favorites</p>
            <div className="grid gap-2.5 mb-5" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))" }}>
              {([
                ["Fav Language",       tempFavLang,       setTempFavLang,       "e.g. C++, Rust, GLSL"],
                ["Least Fav Language", tempLeastFavLang,  setTempLeastFavLang,  "e.g. Java, PHP"],
                ["Fav UMN Class",      tempFavClass,      setTempFavClass,      "e.g. CSCI 5607"],
                ["Fav Professor",      tempFavProf,       setTempFavProf,       "e.g. Stephen Guy"],
                ["Fav Game",           tempFavGame,       setTempFavGame,       "e.g. Hollow Knight"],
                ["Fav Graphics Topic", tempFavTopic,      setTempFavTopic,      "e.g. Ray Tracing"],
                ["Operating System",   tempOS,            setTempOS,            "e.g. Windows, Linux, macOS"],
                ["Graphics Software",  tempSoftware,      setTempSoftware,      "e.g. Blender, Unreal Engine"],
              ] as [string, string, (v: string) => void, string][]).map(([label, val, set, placeholder]) => (
                <div key={label}>
                  <label className="label-gold text-[10px] mb-1 block">{label}</label>
                  <input className="input-glass" value={val} onChange={e => set(e.target.value)} placeholder={placeholder} />
                </div>
              ))}
            </div>
            {/* Links + Major */}
            <p className="label-gold m-0 mb-3 block text-[11px] uppercase tracking-widest">About You</p>
            <div className="grid gap-2.5" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))" }}>
              <div>
                <label className="label-gold text-[10px] mb-1 block">Major</label>
                <input className="input-glass" value={tempMajor} onChange={e => setTempMajor(e.target.value)} placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="label-gold text-[10px] mb-1 block">GitHub URL</label>
                <input className="input-glass" value={tempGithub} onChange={e => setTempGithub(e.target.value)} placeholder="github.com/username" />
              </div>
              <div>
                <label className="label-gold text-[10px] mb-1 block">LinkedIn URL</label>
                <input className="input-glass" value={tempLinkedin} onChange={e => setTempLinkedin(e.target.value)} placeholder="linkedin.com/in/username" />
              </div>
              <div>
                <label className="label-gold text-[10px] mb-1 block">Other Link</label>
                <input className="input-glass" value={tempOtherUrl} onChange={e => setTempOtherUrl(e.target.value)} placeholder="Portfolio, itch.io, etc." />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile detail card — only renders if any extended field is set */}
      {!isEditing && (user.major || user.fav_language || user.fav_class || user.fav_professor || user.fav_game || user.fav_graphics_topic || user.least_fav_language || user.operating_system || user.graphics_software || user.github_url || user.linkedin_url || user.other_url) && (
        <div className="glass mb-7 p-[clamp(18px,3vw,24px)]">
          <div className="shine-bar" />
          <h2 className="font-ui text-gold m-0 mb-4 text-[15px] relative uppercase tracking-widest">Profile Details</h2>
          <div className="grid gap-x-8 gap-y-3 relative" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))" }}>
            {([
              ["Major",           user.major],
              ["Fav Language",    user.fav_language],
              ["Least Fav Lang",  user.least_fav_language],
              ["Fav Class",       user.fav_class],
              ["Fav Professor",   user.fav_professor],
              ["Fav Game",        user.fav_game],
              ["Fav Topic",       user.fav_graphics_topic],
              ["OS",              user.operating_system],
              ["Software",        user.graphics_software],
            ] as [string, string | null | undefined][]).filter(([, v]) => v).map(([label, val]) => (
              <div key={label}>
                <div className="font-ui text-[10px] uppercase tracking-widest mb-0.5" style={{ color:"rgba(255,204,51,.5)" }}>{label}</div>
                <div className="font-ui text-[13px] text-white">{val}</div>
              </div>
            ))}
            {([
              ["GitHub",    user.github_url],
              ["LinkedIn",  user.linkedin_url],
              ["Link",      user.other_url],
            ] as [string, string | null | undefined][]).filter(([, v]) => v).map(([label, url]) => (
              <div key={label}>
                <div className="font-ui text-[10px] uppercase tracking-widest mb-0.5" style={{ color:"rgba(255,204,51,.5)" }}>{label}</div>
                <a href={url!.startsWith('http') ? url! : `https://${url}`} target="_blank" rel="noreferrer"
                  className="font-ui text-[13px] truncate block" style={{ color:"#FFCC33" }}>{url}</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 mb-7" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(clamp(140px,25vw,200px),1fr))" }}>
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-5 text-center transition-[transform,box-shadow] duration-200"
            onMouseOver={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 6px 32px rgba(80,0,15,0.22),0 1.5px 0 rgba(255,255,255,0.65) inset,0 0 20px rgba(255,204,51,0.3)"; }}
            onMouseOut ={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
            <div className="shine-bar" />
            <AssetIcon name={s.icon} size={28} className="mb-2 relative" />
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
                {p.thumbnail ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ border:"1px solid rgba(255,204,51,.2)" }}>
                    <img src={getImageUrl(p.thumbnail)} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center font-ui font-bold text-sm"
                    style={{ background:"rgba(122,0,25,.35)", border:"1px solid rgba(255,204,51,.2)", color:"rgba(255,204,51,.6)" }}>
                    {p.title.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-ui text-white text-sm font-bold truncate">{p.title}</div>
                  <div className="font-ui text-[12px] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color:"rgba(255,215,175,.5)" }}>{p.description}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setProjectToDelete(p); }} disabled={deleteProjectMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight text-red-400 border border-red-400/30 hover:bg-red-400/10 hover:border-red-400/60 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] flex-shrink-0">
                  Delete
                </button>
                <span className="font-ui text-[11px] flex-shrink-0" style={{ color:"rgba(255,210,170,.35)" }}>{p.date_label}</span>
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
            <AssetIcon name={card.icon} size={28} className="mb-2 relative" />
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
              <button onClick={() => deleteProjectMutation.mutate(projectToDelete.id)} disabled={deleteProjectMutation.isPending}
                className="btn-vista px-5 py-2.5 text-sm text-white" style={{ background:"rgba(180,0,0,.6)", border:"1.5px solid rgba(255,100,100,.4)" }}>
                  {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteAccountConfirm(false)}>
          <div className="glass w-[min(400px,94vw)] p-7 animate-[modalIn_.2s_ease]" onClick={e => e.stopPropagation()}>
            <div className="shine-bar" />
            <h3 className="font-ui text-red-400 m-0 mb-3 text-lg font-bold relative">Delete Your Account?</h3>
            <p className="font-ui text-white/80 text-[14px] mb-6 relative">
              This will permanently remove your profile, all <strong className="text-white">{myProjects.length} projects</strong>, 
              and all your messages. This action <strong className="text-white">cannot be undone</strong>.
            </p>
            <div className="flex justify-end gap-3 w-full relative">
              <button onClick={() => setShowDeleteAccountConfirm(false)}
                className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={() => deleteAccountMutation.mutate()} disabled={deleteAccountMutation.isPending}
                className="btn-vista px-6 py-2.5 text-sm text-white" style={{ background:"rgba(180,0,0,.8)", border:"1.5px solid rgba(255,100,100,.4)" }}>
                  {deleteAccountMutation.isPending ? "Deleting..." : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
