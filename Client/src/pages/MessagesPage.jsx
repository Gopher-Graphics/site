import React, { useState, useRef, useEffect } from "react";

export function MessagesPage({ user, users, channels, setChannels, messagesByChannel, setMessagesByChannel, directMessages, setDirectMessages }) {
  const [activeTab, setActiveTab]           = useState({ type: "channel", id: "general" });
  const [draft, setDraft]                   = useState("");
  const [showSidebar, setShowSidebar]       = useState(false);
  const [isMobile, setIsMobile]             = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [joinedChannels, setJoinedChannels] = useState(["general"]);
  const [showBrowseChannels, setShowBrowseChannels] = useState(false);
  const [showNewDM, setShowNewDM]           = useState(false);
  const fileRef  = useRef(null);
  const [attachment, setAttachment]         = useState(null);
  const [uploading, setUploading]           = useState(false);
  const [replyingTo, setReplyingTo]         = useState(null);
  const bottomRef = useRef(null);

  const messages         = activeTab.type === "channel" ? (messagesByChannel[activeTab.id] || []) : (directMessages[activeTab.id] || []);
  const activeChannelObj = activeTab.type === "channel" ? channels.find(c => c.id === activeTab.id) : null;
  const activeDMUser     = activeTab.type === "dm"      ? users.find(u => u.x500 === activeTab.id) : null;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, activeTab]);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = ev => { setAttachment({ type:"image", data:ev.target.result, name:file.name }); setUploading(false); };
    reader.readAsDataURL(file);
    e.target.value = null;
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text && !attachment) return;
    const newMsg = { id:Date.now(), author:user.name, avatar:user.avatar, text, time:"Just now", isMe:true, image_data: attachment ? attachment.data : null, replyToMsg: replyingTo ? { ...replyingTo } : null };
    if (activeTab.type === "channel") {
      setMessagesByChannel(prev => ({ ...prev, [activeTab.id]: [...(prev[activeTab.id]||[]), newMsg] }));
    } else {
      setDirectMessages(prev => ({ ...prev, [activeTab.id]: [...(prev[activeTab.id]||[]), newMsg] }));
    }
    setDraft(""); setAttachment(null); setReplyingTo(null);
  }

  function createChannel() {
    const id = newChannelName.toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");
    if (!id || channels.some(c => c.id === id)) return;
    setChannels(prev => [...prev, { id, name:id, desc:newChannelDesc }]);
    setJoinedChannels(prev => [...prev, id]);
    setActiveTab({ type:"channel", id });
    setShowCreateChannel(false); setNewChannelName(""); setNewChannelDesc("");
  }

  function joinChannel(id) {
    if (!joinedChannels.includes(id)) {
      setJoinedChannels(prev => [...prev, id]);
      const sysMsg = { id: Date.now(), type: "system_join", author: user.name, time: "Just now" };
      setMessagesByChannel(prev => ({ ...prev, [id]: [...(prev[id] || []), sysMsg] }));
    }
    setActiveTab({ type:"channel", id }); setShowBrowseChannels(false); setShowSidebar(false);
  }

  function leaveChannel(id) {
    const updated = joinedChannels.filter(c => c !== id);
    setJoinedChannels(updated);
    const sysMsg = { id: Date.now(), type: "system_leave", author: user.name, time: "Just now" };
    setMessagesByChannel(prev => ({ ...prev, [id]: [...(prev[id] || []), sysMsg] }));
    if (activeTab.type === "channel" && activeTab.id === id) {
      setActiveTab({ type: "channel", id: updated.length > 0 ? updated[0] : "general" });
    }
  }

  function startDM(targetUser) {
    if (!directMessages[targetUser.x500]) setDirectMessages(prev => ({ ...prev, [targetUser.x500]:[] }));
    setActiveTab({ type:"dm", id:targetUser.x500 }); setShowNewDM(false); setShowSidebar(false);
  }

  // Shared sidebar JSX
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Channels */}
      <div className="px-3 pt-2.5 pb-1 mb-1">
        <div className="flex justify-between items-center">
          <div className="font-ui text-gold text-[12px] font-bold tracking-[0.06em] uppercase opacity-80">Joined Channels</div>
          <div className="flex gap-2.5">
            <button onClick={() => setShowBrowseChannels(true)} className="text-gold text-[12px] font-ui underline opacity-80">Browse</button>
            <button onClick={() => setShowCreateChannel(true)}  className="text-gold text-base font-ui leading-none">+</button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 overflow-y-auto flex-shrink-0 max-h-[40vh]">
        {channels.filter(c => joinedChannels.includes(c.id)).map(c => {
          const active = activeTab.type === "channel" && activeTab.id === c.id;
          return (
            <button key={c.id} onClick={() => { setActiveTab({type:"channel",id:c.id}); setShowSidebar(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md border-none text-left transition-all duration-100"
              style={{ background: active ? "rgba(255,204,51,.12)" : "transparent" }}>
              <span className="font-mono text-sm" style={{ color: active ? "#FFCC33" : "rgba(255,255,255,.5)" }}>#</span>
              <div className="font-ui text-[13px] truncate" style={{ color: active ? "#FFCC33" : "rgba(255,225,195,.7)", fontWeight: active ? 600 : 400 }}>{c.name}</div>
            </button>
          );
        })}
      </div>

      {/* DMs */}
      <div className="px-3 pt-4 pb-1 mt-2 mb-1" style={{ borderTop:"1px solid rgba(255,255,255,.08)" }}>
        <div className="flex justify-between items-center">
          <div className="font-ui text-gold text-[12px] font-bold tracking-[0.06em] uppercase opacity-80">Direct Messages</div>
          <button onClick={() => setShowNewDM(true)} className="text-gold text-base font-ui leading-none">+</button>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
        {Object.keys(directMessages).map(dmId => {
          const u = users.find(userObj => userObj.x500 === dmId);
          if (!u) return null;
          const active = activeTab.type === "dm" && activeTab.id === dmId;
          return (
            <button key={dmId} onClick={() => { setActiveTab({type:"dm",id:dmId}); setShowSidebar(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md border-none text-left transition-all duration-100"
              style={{ background: active ? "rgba(255,204,51,.12)" : "transparent" }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] text-white font-ui" style={{ background:"rgba(255,255,255,.1)" }}>{u.name.charAt(0)}</div>
              <div className="font-ui text-[13px] truncate" style={{ color: active ? "#FFCC33" : "rgba(255,225,195,.7)", fontWeight: active ? 600 : 400 }}>{u.name}</div>
            </button>
          );
        })}
        {Object.keys(directMessages).length === 0 && (
          <div className="px-3 py-2.5 font-ui text-[12px] italic" style={{ color:"rgba(255,255,255,.3)" }}>No active DMs</div>
        )}
      </div>

      {/* User footer */}
      <div className="mt-auto px-2.5 pt-3 pb-1 flex items-center gap-2.5 flex-shrink-0" style={{ borderTop:"1px solid rgba(255,204,51,.1)" }}>
        <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0" style={{ border:"2px solid rgba(255,204,51,.35)" }}>
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="font-ui text-white text-[13px] font-semibold truncate">{user.name}</div>
          <div className="font-ui text-gold text-[11px] opacity-65 truncate">{user.role}</div>
        </div>
      </div>
    </div>
  );

  // Modal wrapper helper
  const modalOverlay = (onClose, children) => (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,.6)", backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div className="glass w-full max-w-[400px] p-6" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex" style={{ height:"calc(100vh - 60px)", boxSizing:"border-box" }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="flex-shrink-0 flex flex-col py-2 px-2 pb-4" style={{ width:240, borderRight:"1px solid rgba(255,255,255,.12)", background:"linear-gradient(180deg, rgba(30,0,8,.5), rgba(15,0,4,.6))", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" }}>
          {sidebarContent}
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && showSidebar && (
        <div className="fixed top-[60px] inset-x-0 bottom-0 z-50 flex flex-col gap-1 px-3.5 pt-4 animate-[fadeIn_.2s_ease_both]"
          style={{ background:"linear-gradient(180deg, rgba(25,0,8,.96), rgba(12,0,3,.98))", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)" }}>
          {sidebarContent}
          <button onClick={() => setShowSidebar(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg"
            style={{ background:"rgba(255,255,255,.1)" }}>✕</button>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Header */}
        <div className="flex items-center gap-3 flex-shrink-0"
          style={{ padding: isMobile ? "10px 14px" : "14px 24px", borderBottom:"1px solid rgba(255,255,255,.12)", background:"linear-gradient(180deg, rgba(30,0,8,.35), rgba(15,0,4,.25))", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)" }}>
          {isMobile && (
            <button onClick={() => setShowSidebar(true)}
              className="flex-shrink-0 text-sm px-2 py-1 rounded-md text-white"
              style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.2)" }}>☰</button>
          )}
          {activeTab.type === "channel" ? (
            <>
              <span className="font-mono" style={{ fontSize: isMobile ? 18 : 22, color:"rgba(255,255,255,0.7)" }}>#</span>
              <div className="min-w-0 flex-1">
                <div className="font-ui text-white font-bold" style={{ fontSize: isMobile ? 14 : 16 }}>{activeChannelObj?.name}</div>
                {!isMobile && <div className="font-ui text-[12px] truncate" style={{ color:"rgba(255,215,175,.5)" }}>{activeChannelObj?.desc}</div>}
              </div>
              {activeChannelObj?.id !== "general" && (
                <button onClick={() => leaveChannel(activeChannelObj?.id)}
                  className="btn-ghost px-2.5 py-1 text-[11px] ml-2">Leave</button>
              )}
            </>
          ) : (
            <>
              <div className="rounded-full overflow-hidden" style={{ width: isMobile?24:32, height: isMobile?24:32, border:"1px solid rgba(255,255,255,0.2)" }}>
                <img src={activeDMUser?.avatar} alt={activeDMUser?.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="font-ui text-white font-bold" style={{ fontSize: isMobile ? 14 : 16 }}>{activeDMUser?.name}</div>
                {!isMobile && <div className="font-ui text-[12px]" style={{ color:"rgba(255,215,175,.5)" }}>Direct Message</div>}
              </div>
            </>
          )}
          <div className="ml-auto font-ui text-[12px] flex-shrink-0" style={{ color:"rgba(255,210,170,.35)" }}>{messages.length} msgs</div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1" style={{ padding: isMobile ? "14px 12px" : "20px 24px" }}>
          {messages.length === 0 && (
            <div className="m-auto text-center opacity-50">
              <div className="font-ui text-white text-base font-semibold">No messages yet</div>
              <div className="font-ui text-white text-[13px]">Be the first to say hello!</div>
            </div>
          )}
          {messages.map((m, i) => {
            if (m.type === "system_join" || m.type === "system_leave") {
              const Icon = m.type === "system_join" ? "→" : "←";
              const color = m.type === "system_join" ? "rgba(100,255,100,.5)" : "rgba(255,100,100,.5)";
              return (
                <div key={m.id} className="flex items-center justify-center gap-2 my-2 animate-[fadeIn_.3s_ease]">
                  <span className="font-ui text-[14px] font-bold" style={{ color }}>{Icon}</span>
                  <span className="font-ui text-[12px]" style={{ color:"rgba(255,255,255,.4)" }}>
                    <strong style={{ color:"rgba(255,255,255,.7)" }}>{m.author}</strong> {m.type === "system_join" ? "hopped into the channel." : "left the channel."}
                  </span>
                </div>
              );
            }

            const isMe = m.isMe || m.author === user.name;
            let prevSame = false;
            if (i > 0) {
              const prev = messages[i-1];
              if (!prev.type && !m.type && prev.author === m.author && !prev.isMe && !m.isMe) {
                prevSame = true;
              }
            }
            return (
              <div key={m.id} className="flex gap-3 animate-[fadeIn_.3s_ease]" style={{ marginTop: prevSame ? 0 : 12 }}>
                <div className="w-9 flex-shrink-0 flex justify-center">
                  {!prevSame && (
                    <div className="w-9 h-9 rounded-full overflow-hidden" style={{ border: isMe ? "1px solid rgba(255,204,51,.4)" : "1px solid rgba(255,255,255,.2)" }}>
                      <img src={m.avatar || (isMe ? user.avatar : users.find(u => u.name===m.author)?.avatar)} alt={m.author} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 group">
                  {!prevSame && (
                    <div className="flex items-baseline gap-2 mb-0.5 relative">
                      <span className="font-ui font-bold text-sm" style={{ color: isMe ? "#FFCC33" : "#fff" }}>{isMe ? "You" : m.author}</span>
                      <span className="font-ui text-[11px]" style={{ color:"rgba(255,255,255,.3)" }}>{m.time}</span>
                      <button onClick={() => setReplyingTo(m)} className="ml-2 text-[10px] text-gold opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold tracking-wider">Reply ↵</button>
                    </div>
                  )}
                  {m.replyToMsg && (
                    <div className="mb-1 border-l-2 border-[#FFCC33] border-opacity-40 pl-2.5 py-0.5 opacity-70">
                      <div className="text-[11px] font-bold text-[#FFCC33] mb-0.5">Replying to {m.replyToMsg.author}</div>
                      <div className="text-[12px] italic truncate text-white">{m.replyToMsg.text || "[Attachment]"}</div>
                    </div>
                  )}
                  {m.text && (
                    <div className="font-ui text-[14.5px] leading-[1.5] break-words" style={{ color:"rgba(255,235,215,.9)" }}>{m.text}</div>
                  )}
                  {m.image_data && (
                    <div className="mt-2" style={{ maxWidth: isMobile ? "100%" : 400 }}>
                      <div className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,204,51,.2)", boxShadow:"0 4px 12px rgba(0,0,0,.2)", background:"rgba(0,0,0,.2)" }}>
                        <img src={m.image_data} alt="Attached image" className="w-full block" style={{ maxHeight:300, objectFit:"contain" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} className="h-px" />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0" style={{ padding: isMobile ? "8px 10px" : "16px 24px", background:"linear-gradient(0deg, rgba(15,0,4,.8), rgba(15,0,4,.4))", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderTop:"1px solid rgba(255,255,255,.08)" }}>
          {replyingTo && (
            <div className="flex items-start justify-between bg-white/5 border border-white/10 rounded-lg p-2.5 mb-2.5">
              <div className="min-w-0 flex-1 border-l-2 border-[#FFCC33] pl-2.5">
                <div className="text-[11px] font-bold text-[#FFCC33] mb-0.5">Replying to {replyingTo.author}</div>
                <div className="text-[12px] italic truncate text-white/70">{replyingTo.text || "[Attachment]"}</div>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-white/50 hover:text-white ml-2 text-sm leading-none pt-0.5">✕</button>
            </div>
          )}
          {attachment && (
            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 mb-2.5 w-max max-w-full" style={{ background:"rgba(255,204,51,.1)", border:"1px solid rgba(255,204,51,.3)" }}>
              <span className="text-sm text-white font-mono">[IMG]</span>
              <div className="font-ui text-white text-[12px] overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{attachment.name}</div>
              <button onClick={() => setAttachment(null)} className="text-[rgba(255,255,255,.6)] text-sm ml-1">✕</button>
            </div>
          )}
          <div className="flex items-end gap-2 glass-dark rounded-[24px] pl-4 pr-1.5 py-1.5" style={{ border:"1px solid rgba(255,255,255,.15)" }}>
            <button onClick={() => fileRef.current?.click()} className="text-gold text-xl px-1 py-1.5 flex-shrink-0 self-center">+</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <textarea value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Message ${activeTab.type==="channel" ? `#${activeChannelObj?.name}` : activeDMUser?.name}...`}
              rows={1}
              className="flex-1 bg-transparent border-none text-white font-ui text-sm resize-none outline-none py-2.5 max-h-[120px]" />
            {uploading ? (
              <div className="font-ui text-gold text-[12px] px-2.5 py-2.5 self-center">Loading…</div>
            ) : (
              <button onClick={sendMessage} disabled={!draft.trim() && !attachment}
                className={`btn-vista px-4 py-2 rounded-[18px] text-sm text-[#3a0008] flex-shrink-0 ${!draft.trim() && !attachment ? "opacity-50" : ""}`}>
                Send
              </button>
            )}
          </div>
          <div className="text-right mt-1.5 font-ui text-[10px]" style={{ color:"rgba(255,255,255,.3)" }}>Press Enter to send</div>
        </div>

        {/* Browse Channels modal */}
        {showBrowseChannels && modalOverlay(() => setShowBrowseChannels(false), (
          <>
            <h3 className="font-ui text-white m-0 mb-4">Browse Channels</h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
              {channels.filter(c => !joinedChannels.includes(c.id)).map(c => (
                <div key={c.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)" }}>
                  <div className="min-w-0">
                    <div className="font-ui text-white text-sm font-semibold">#{c.name}</div>
                    <div className="font-ui text-[12px] truncate" style={{ color:"rgba(255,255,255,.5)" }}>{c.desc}</div>
                  </div>
                  <button onClick={() => joinChannel(c.id)} className="btn-vista px-3 py-1.5 text-[12px] text-[#3a0008] flex-shrink-0">Join</button>
                </div>
              ))}
              {channels.filter(c => !joinedChannels.includes(c.id)).length === 0 && (
                <div className="font-ui text-center my-5" style={{ color:"rgba(255,255,255,.4)" }}>You have joined all available channels.</div>
              )}
            </div>
            <button onClick={() => setShowBrowseChannels(false)} className="btn-ghost w-full mt-4 py-2.5">Done</button>
          </>
        ))}

        {/* Create Channel modal */}
        {showCreateChannel && modalOverlay(() => setShowCreateChannel(false), (
          <>
            <h3 className="font-ui text-white m-0 mb-4">Create New Channel</h3>
            <input className="input-glass mb-3" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="Channel Name (e.g. graphics-api)" />
            <input className="input-glass mb-5"  value={newChannelDesc} onChange={e => setNewChannelDesc(e.target.value)} placeholder="Description (optional)" />
            <div className="flex gap-2.5">
              <button onClick={createChannel}                  className="btn-vista flex-1 py-2.5 text-[#3a0008]">Create</button>
              <button onClick={() => setShowCreateChannel(false)} className="btn-ghost flex-1 py-2.5">Cancel</button>
            </div>
          </>
        ))}

        {/* New DM modal */}
        {showNewDM && modalOverlay(() => setShowNewDM(false), (
          <>
            <h3 className="font-ui text-white m-0 mb-4">Start Direct Message</h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
              {users.filter(u => u.x500 !== user.x500).map(u => (
                <button key={u.x500} onClick={() => startDM(u)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-white text-left cursor-pointer border-none"
                  style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-ui" style={{ background:"rgba(255,255,255,.1)" }}>{u.name.charAt(0)}</div>
                  <div>
                    <div className="font-ui text-sm font-semibold">{u.name}</div>
                    <div className="font-ui text-[12px]" style={{ color:"rgba(255,255,255,.5)" }}>{u.role}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowNewDM(false)} className="btn-ghost w-full mt-4 py-2.5">Cancel</button>
          </>
        ))}
      </div>
    </div>
  );
}
