import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { getUserByUsername } from "../api/users";
import { getProjects } from "../api/projects";
import { getImageUrl } from "../api/http";
import { pickDefaultAvatar } from "../constants/defaultAvatars";
import { AssetIcon, type AssetIconName } from "../components/AssetIcon";

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user", username],
    queryFn: () => getUserByUsername(username!),
    enabled: !!username,
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => getProjects({ author_id: user?.id }),
    enabled: !!user?.id,
  });

  const userProjects = projectsData?.projects || [];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center font-ui text-white">
        Loading...
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center font-ui text-white">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p className="opacity-70 mb-6">The user you are looking for does not exist or has been removed.</p>
        <Link to="/about" className="btn-vista px-6 py-2.5 text-[13px] text-[#3a0008]">
          Back to About Page
        </Link>
      </div>
    );
  }

  const hasExtendedProfile =
    user.major ||
    user.fav_language ||
    user.fav_class ||
    user.fav_professor ||
    user.fav_game ||
    user.fav_graphics_topic ||
    user.least_fav_language ||
    user.operating_system ||
    user.graphics_software ||
    user.github_url ||
    user.linkedin_url ||
    user.other_url;

  const stats: Array<{ label: string; value: string | number; icon: AssetIconName }> = [
    { label:"Projects Uploaded", value: userProjects.length || 0, icon:"project" },
    { label:"Club Rank", value: user?.role || "Member", icon:"medal" },
    { label:"Member Since", value: user?.member_since ? new Date(user.member_since).getFullYear() : "Unknown", icon:"star" },
  ];

  return (
    <div className="min-h-screen max-w-[800px] mx-auto px-[clamp(16px,4vw,32px)] pt-[clamp(32px,5vw,48px)] pb-16 animate-[fadeUp_.6s_ease_both]">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="font-ui text-[13px] hover:underline" style={{ color: "rgba(255,204,51,.8)" }}>
          ← Back
        </button>
      </div>

      <div className="glass mb-7 p-[clamp(24px,4vw,40px)] flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
        <div className="shine-bar" />
        <div className="relative flex-shrink-0">
          <div
            className="rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-ui font-bold text-3xl sm:text-4xl text-gold"
            style={{
              width: "clamp(80px, 12vw, 100px)",
              height: "clamp(80px, 12vw, 100px)",
              background: "rgba(122,0,25,.45)",
              border: "3px solid #FFCC33",
              boxShadow: "0 0 20px rgba(255,204,51,0.3)",
            }}
          >
            {user.avatar_url || true ? (
              <img
                src={getImageUrl(pickDefaultAvatar(user.avatar_url))}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              user.name
                .split(" ")
                .map((w) => w[0])
                .join("")
            )}
          </div>
        </div>
        <div className="text-center sm:text-left flex-1 min-w-0">
          <h1
            className="font-ui font-bold text-white mb-2"
            style={{ fontSize: "clamp(24px,4vw,32px)", textShadow: "0 2px 16px rgba(255,204,51,.3)" }}
          >
            {user.name}
          </h1>
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            <span
              className="font-ui text-gold text-[13px] px-3.5 py-0.5 rounded-full"
              style={{ background: "rgba(122,0,25,.35)", border: "1px solid rgba(255,204,51,.3)" }}
            >
              {user.role}
            </span>
            <span className="font-ui text-[13px]" style={{ color: "rgba(255,210,170,.45)" }}>
              @{user.username}
            </span>
          </div>
          {user.member_since && (
            <div className="font-ui text-[12px] mt-3" style={{ color: "rgba(255,255,255,.4)" }}>
              Member since {new Date(user.member_since).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Message Button */}
        {currentUser && currentUser.id !== user.id && (
          <div className="flex gap-2.5 w-full sm:w-auto justify-center sm:justify-end mt-4 sm:mt-0">
            <Link to={`/messages?type=dm&id=${user.id}`}
              className="btn-vista px-6 py-2.5 text-[13px] text-[#3a0008] flex items-center gap-2">
              Message
            </Link>
          </div>
        )}
      </div>

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

      {hasExtendedProfile ? (
        <div className="glass mb-7 p-[clamp(18px,3vw,24px)]">
          <div className="shine-bar" />
          <h2 className="font-ui text-gold m-0 mb-4 text-[15px] relative uppercase tracking-widest">Profile Details</h2>
          <div className="grid gap-x-8 gap-y-4 relative" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
            {(
              [
                ["Major", user.major],
                ["Fav Language", user.fav_language],
                ["Least Fav Lang", user.least_fav_language],
                ["Fav Class", user.fav_class],
                ["Fav Professor", user.fav_professor],
                ["Fav Game", user.fav_game],
                ["Fav Topic", user.fav_graphics_topic],
                ["OS", user.operating_system],
                ["Software", user.graphics_software],
              ] as [string, string | null | undefined][]
            )
              .filter(([, v]) => v)
              .map(([label, val]) => (
                <div key={label}>
                  <div className="font-ui text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,204,51,.5)" }}>
                    {label}
                  </div>
                  <div className="font-ui text-[13.5px] text-white/90">{val}</div>
                </div>
              ))}
            {(
              [
                ["GitHub", user.github_url],
                ["LinkedIn", user.linkedin_url],
                ["Link", user.other_url],
              ] as [string, string | null | undefined][]
            )
              .filter(([, v]) => v)
              .map(([label, url]) => (
                <div key={label}>
                  <div className="font-ui text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,204,51,.5)" }}>
                    {label}
                  </div>
                  <a
                    href={url!.startsWith("http") ? url! : `https://${url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-ui text-[13.5px] truncate block hover:underline"
                    style={{ color: "#FFCC33" }}
                  >
                    {url}
                  </a>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center mt-8 mb-4">
          <div className="font-ui text-[14px]" style={{ color: "rgba(255,255,255,.4)" }}>
            This user hasn't added any profile details yet.
          </div>
        </div>
      )}

      {/* Projects */}
      <div className="glass mb-6 p-[clamp(18px,3vw,24px)]">
        <div className="shine-bar" />
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2.5 relative">
          <h2 className="font-ui text-gold m-0 text-[18px]">Projects Uploaded</h2>
        </div>
        {userProjects.length > 0 ? (
          <div className="flex flex-col gap-3 relative">
            {userProjects.map(p => (
              <Link to={`/projects`} key={p.id} className="group flex items-center gap-[clamp(10px,2vw,16px)] px-4 py-3.5 rounded-xl transition-all duration-[180ms] relative"
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
                  <div className="font-ui text-white text-sm font-bold truncate group-hover:text-gold transition-colors">{p.title}</div>
                  <div className="font-ui text-[12px] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color:"rgba(255,215,175,.5)" }}>{p.description}</div>
                </div>
                <span className="font-ui text-[11px] flex-shrink-0" style={{ color:"rgba(255,210,170,.35)" }}>{p.date_label}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-7 relative">
            <p className="font-ui text-[14px]" style={{ color:"rgba(255,215,175,.5)" }}>This user hasn't uploaded any projects yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
