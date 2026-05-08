import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProjectDetailModal } from "../components/ProjectDetailModal";
import { Project } from "../types";
import { getProjects } from "../api/projects";
import { getImageUrl } from "../api/http";

export function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  if (isLoading) {
    return <div className="min-h-screen text-center pt-20 text-white font-ui">Loading projects...</div>;
  }

  if (isError || !data) {
    return <div className="min-h-screen text-center pt-20 text-red-400 font-ui">Failed to load projects.</div>;
  }

  const { projects } = data;
  
  const parsedProjects = projects.map((p: any) => ({
    ...p,
    tags: Array.isArray(p.tags) ? p.tags.map((t: any) => t.name || t) : []
  }));

  // Derive unique tags from the projects list
  const usedTags = Array.from(new Set(parsedProjects.flatMap(p => p.tags))).sort();
  const allTags = ["All", ...usedTags];

  const filtered = filter === "All" ? parsedProjects : parsedProjects.filter((p: any) => p.tags.includes(filter));

  const sortedProjects = [...filtered].sort((a: any, b: any) => {
    const parseDate = (dateLabel: string) => {
      if (!dateLabel) return new Date(0);
      const monthMap: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      const parts = dateLabel.trim().split(/\s+/);
      const month = monthMap[parts[0]] ?? 0;
      const year = parseInt(parts[1]) || new Date().getFullYear();
      return new Date(year, month);
    };
    return parseDate(b.date_label).getTime() - parseDate(a.date_label).getTime();
  });

  return (
    <>
      <div className="min-h-screen max-w-[1100px] mx-auto px-[clamp(16px,4vw,32px)] pt-[clamp(32px,5vw,48px)] pb-16 animate-[fadeUp_.6s_ease_both]">

        <h1 className="font-ui font-bold text-white mb-1" style={{ fontSize:"clamp(26px,4vw,48px)", textShadow:"0 2px 24px rgba(255,204,51,.4)" }}>Member Projects</h1>
        <div className="w-[60px] h-[3px] mb-2.5 rounded-sm" style={{ background:"linear-gradient(90deg,#FFCC33,transparent)" }} />
        <p className="font-ui mb-7 text-[15px]" style={{ color:"rgba(255,225,195,.6)" }}>Work created by Gopher Graphics members</p>

        <div className="flex gap-2 flex-wrap mb-9">
          {allTags.map(t => {
            const active = filter === t;
            return (
              <button key={t} onClick={() => setFilter(t)}
                className={active ? "btn-vista px-[18px] py-1.5 text-[13px] text-[#3a0008]" : "btn-ghost px-[18px] py-1.5 text-[13px] text-[rgba(255,225,190,.85)]"}>
                {t}
              </button>
            );
          })}
        </div>

        {sortedProjects.length === 0 ? (
          <div className="text-center py-20 text-[rgba(255,225,190,.6)] font-ui">No projects found.</div>
        ) : (
          <div className="grid gap-[22px]" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(clamp(250px,40vw,300px),1fr))" }}>
            {sortedProjects.map((p: any, i: number) => (
              <div key={p.id} onClick={() => setSelectedProjectId(p.id)}
                className="glass-card p-0 overflow-hidden cursor-pointer transition-[transform,box-shadow] duration-[220ms]"
                style={{ animation:`fadeUp .5s ease ${i * .06}s both` }}
                onMouseOver={e => { e.currentTarget.style.transform="translateY(-6px) scale(1.015)"; e.currentTarget.style.boxShadow="0 24px 56px rgba(80,0,15,.3), 0 0 20px rgba(255,204,51,0.3)"; }}
                onMouseOut ={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                <div className="shine-bar" style={{ zIndex:2 }} />

                {p.thumbnail ? (
                  <div className="relative overflow-hidden aspect-video" style={{ background:"#0a0004", borderBottom:"1px solid rgba(255,204,51,.18)" }}>
                    <img src={getImageUrl(p.thumbnail)} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center relative overflow-hidden" style={{ background:"linear-gradient(135deg,rgba(122,0,25,.55),rgba(180,100,0,.3))", borderBottom:"1px solid rgba(255,204,51,.15)" }}>
                    <div className="absolute inset-0" style={{ background:"radial-gradient(circle at 30% 40%,rgba(255,204,51,.08),transparent 60%)" }} />
                    <span className="font-ui font-bold text-2xl" style={{ color:"rgba(255,204,51,.4)" }}>{p.title.slice(0,2).toUpperCase()}</span>
                  </div>
                )}

                <div className="px-5 py-[18px] relative">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-ui text-white font-bold text-base m-0">{p.title}</h3>
                    <span className="font-ui text-[11px] flex-shrink-0 ml-2" style={{ color:"rgba(255,210,170,.45)" }}>{p.date_label}</span>
                  </div>
                  <p className="font-ui text-[13px] mb-3.5 leading-[1.5]" style={{ color:"rgba(255,225,200,.62)" }}>{p.description}</p>
                  <div className="flex justify-between items-center flex-wrap gap-1.5">
                    <span className="font-ui text-[12px]" style={{ color:"rgba(255,215,175,.72)" }}>by {p.author_name || p.author_username}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {p.tags.map((t: string) => <span key={t} className="tag-pill">{t}</span>)}
                    </div>
                  </div>
                  <div className="mt-3.5 pt-3 text-center" style={{ borderTop:"1px solid rgba(255,204,51,.08)" }}>
                    <span className="font-ui text-[12px] tracking-[0.04em]" style={{ color:"rgba(255,204,51,.55)" }}>View Details →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedProjectId && <ProjectDetailModal projectId={selectedProjectId} onClose={() => setSelectedProjectId(null)} />}
    </>
  );
}
