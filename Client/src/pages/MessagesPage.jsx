import React, { useState, useRef, useEffect } from "react";
import { G } from "../constants/theme";

export function MessagesPage({ user, users, channels, setChannels, messagesByChannel, setMessagesByChannel, directMessages, setDirectMessages }) {
  const [activeTab, setActiveTab] = useState({ type: "channel", id: "general" }); // { type: "channel" | "dm", id: string }
  const [draft, setDraft] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Modals for creating channel / starting DM
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelIcon, setNewChannelIcon] = useState("💬");
  const [newChannelDesc, setNewChannelDesc] = useState("");

  const [showNewDM, setShowNewDM] = useState(false);
  
  // File upload state for messages
  const fileRef = useRef(null);
  const [attachment, setAttachment] = useState(null); // { type: "image" | "file", data: base64 | null, name: string }
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef(null);

  // Get active messages based on tab
  const messages = activeTab.type === "channel" 
    ? (messagesByChannel[activeTab.id] || [])
    : (directMessages[activeTab.id] || []);

  const activeChannelObj = activeTab.type === "channel" ? channels.find(c => c.id === activeTab.id) : null;
  const activeDMUser = activeTab.type === "dm" ? users.find(u => u.x500 === activeTab.id) : null;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, activeTab]);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    
    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachment({
        type: isImage ? "image" : "file",
        data: isImage ? ev.target.result : null,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB"
      });
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text && !attachment) return;
    
    const newMsg = {
      id: Date.now(),
      author: user.name,
      avatar: user.avatar,
      text,
      time: "Just now",
      isMe: true,
      attachment: attachment ? { ...attachment } : null
    };

    if (activeTab.type === "channel") {
      setMessagesByChannel(prev => ({ 
        ...prev, 
        [activeTab.id]: [...(prev[activeTab.id] || []), newMsg] 
      }));
    } else {
      // In a real app we'd update both users' DM states. Here we just update the local one for the current perspective.
      setDirectMessages(prev => ({
        ...prev,
        [activeTab.id]: [...(prev[activeTab.id] || []), newMsg]
      }));
    }
    
    setDraft("");
    setAttachment(null);
  }

  function createChannel() {
    const id = newChannelName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!id) return;
    if (channels.some(c => c.id === id)) return; // already exists

    setChannels(prev => [...prev, { id, name: id, icon: newChannelIcon, desc: newChannelDesc }]);
    setActiveTab({ type: "channel", id });
    setShowCreateChannel(false);
    setNewChannelName("");
    setNewChannelDesc("");
  }

  function startDM(targetUser) {
    if (!directMessages[targetUser.x500]) {
      setDirectMessages(prev => ({ ...prev, [targetUser.x500]: [] }));
    }
    setActiveTab({ type: "dm", id: targetUser.x500 });
    setShowNewDM(false);
    setShowSidebar(false);
  }

  const sidebarContent = (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Channels Section */}
      <div style={{ padding:"10px 12px 0px", marginBottom:4 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:G.ff, color:G.gold, fontSize:12, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", opacity:.8 }}>Channels</div>
          <button onClick={()=>setShowCreateChannel(true)} style={{ background:"none", border:"none", color:G.gold, fontSize:16, cursor:"pointer" }}>+</button>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2, overflowY:"auto", flexShrink:0, maxHeight:"40vh" }}>
        {channels.map(c => {
          const isActive = activeTab.type === "channel" && activeTab.id === c.id;
          return (
            <button key={c.id} onClick={()=>{setActiveTab({type:"channel",id:c.id}); setShowSidebar(false)}} style={{
              display:"flex", alignItems:"center", gap:8, width:"100%",
              padding:"8px 12px", borderRadius:6, border:"none", cursor:"pointer",
              background: isActive ? "rgba(255,204,51,.12)" : "transparent",
              transition:"all .1s ease", textAlign:"left",
            }}>
              <span style={{ fontSize:14 }}>{c.icon}</span>
              <div style={{ fontFamily:G.ff, color: isActive ? G.gold : "rgba(255,225,195,.7)", fontSize:13, fontWeight: isActive ? 600 : 400, textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{c.name}</div>
            </button>
          )
        })}
      </div>

      {/* Direct Messages Section */}
      <div style={{ padding:"16px 12px 0px", marginBottom:4, marginTop:8, borderTop:"1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:G.ff, color:G.gold, fontSize:12, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", opacity:.8 }}>Direct Messages</div>
          <button onClick={()=>setShowNewDM(true)} style={{ background:"none", border:"none", color:G.gold, fontSize:16, cursor:"pointer" }}>+</button>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2, overflowY:"auto", flex:1 }}>
        {Object.keys(directMessages).map(dmId => {
          const u = users.find(userObj => userObj.x500 === dmId);
          if (!u) return null;
          const isActive = activeTab.type === "dm" && activeTab.id === dmId;
          return (
            <button key={dmId} onClick={()=>{setActiveTab({type:"dm",id:dmId}); setShowSidebar(false)}} style={{
              display:"flex", alignItems:"center", gap:8, width:"100%",
              padding:"8px 12px", borderRadius:6, border:"none", cursor:"pointer",
              background: isActive ? "rgba(255,204,51,.12)" : "transparent",
              transition:"all .1s ease", textAlign:"left",
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", width:20, height:20, borderRadius:"50%", background:"rgba(255,255,255,.1)", fontSize:11 }}>{u.emoji}</div>
              <div style={{ fontFamily:G.ff, color: isActive ? G.gold : "rgba(255,225,195,.7)", fontSize:13, fontWeight: isActive ? 600 : 400, textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{u.name}</div>
            </button>
          )
        })}
        {Object.keys(directMessages).length === 0 && (
          <div style={{ padding:"10px 12px", fontFamily:G.ff, color:"rgba(255,255,255,.3)", fontSize:12, fontStyle:"italic" }}>No active DMs</div>
        )}
      </div>

        {/* User Profile Area */}
        <div style={{ marginTop:"auto", padding:"12px 10px 4px", borderTop:"1px solid rgba(255,204,51,.1)", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", overflow:"hidden", border:`2px solid rgba(255,204,51,.35)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <img src={user.avatar} alt={user.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:G.ff, color:"#fff", fontSize:13, fontWeight:600, textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{user.name}</div>
            <div style={{ fontFamily:G.ff, color:G.gold, fontSize:11, opacity:.65, textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{user.role}</div>
          </div>
        </div>
    </div>
  );

  return (
    <div style={{ height:"calc(100vh - 60px)", display:"flex", boxSizing:"border-box" }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <div style={{
          width:240, flexShrink:0, display:"flex", flexDirection:"column",
          padding:"8px 8px 16px",
          borderRight:"1px solid rgba(255,255,255,.12)",
          background:"linear-gradient(180deg, rgba(30,0,8,.5) 0%, rgba(15,0,4,.6) 100%)",
          backdropFilter:"blur(20px)",
          WebkitBackdropFilter:"blur(20px)",
        }}>
          {sidebarContent}
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && showSidebar && (
        <div style={{
          position:"fixed", top:60, left:0, right:0, bottom:0, zIndex:50,
          background:"linear-gradient(180deg, rgba(25,0,8,.96), rgba(12,0,3,.98))",
          backdropFilter:"blur(24px)",
          WebkitBackdropFilter:"blur(24px)",
          padding:"16px 14px", display:"flex", flexDirection:"column", gap:4,
          animation:"fadeIn .2s ease both",
        }}>
          {sidebarContent}
          <button onClick={()=>setShowSidebar(false)} style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,.1)", border:"none", borderRadius:"50%", width:36, height:36, color:"#fff", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>✕</button>
        </div>
      )}

      {/* Main chat area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, position:"relative" }}>
        
        {/* Channel / DM header */}
        <div style={{
          padding: isMobile ? "10px 14px" : "14px 24px",
          borderBottom:"1px solid rgba(255,255,255,.12)",
          display:"flex", alignItems:"center", gap:12,
          background:"linear-gradient(180deg, rgba(30,0,8,.35), rgba(15,0,4,.25))",
          backdropFilter:"blur(16px)",
          WebkitBackdropFilter:"blur(16px)",
          flexShrink:0,
        }}>
          {isMobile && (
            <button onClick={()=>setShowSidebar(true)} style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.2)", borderRadius:6, padding:"4px 8px", color:"#fff", fontSize:14, flexShrink:0 }}>
              ☰
            </button>
          )}
          
          {activeTab.type === "channel" ? (
            <>
              <span style={{ fontSize: isMobile ? 18 : 22 }}>{activeChannelObj?.icon}</span>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:G.ff, color:"#fff", fontSize: isMobile ? 14 : 16, fontWeight:700 }}>#{activeChannelObj?.name}</div>
                {!isMobile && <div style={{ fontFamily:G.ff, color:"rgba(255,215,175,.5)", fontSize:12, textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{activeChannelObj?.desc}</div>}
              </div>
            </>
          ) : (
            <>
              <div style={{ width:isMobile?24:32, height:isMobile?24:32, borderRadius:"50%", overflow:"hidden", border:"1px solid rgba(255,255,255,0.2)" }}>
                <img src={activeDMUser?.avatar} alt={activeDMUser?.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:G.ff, color:"#fff", fontSize: isMobile ? 14 : 16, fontWeight:700 }}>{activeDMUser?.name}</div>
                {!isMobile && <div style={{ fontFamily:G.ff, color:"rgba(255,215,175,.5)", fontSize:12 }}>Direct Message</div>}
              </div>
            </>
          )}
          <div style={{ marginLeft:"auto", fontFamily:G.ff, color:"rgba(255,210,170,.35)", fontSize:12, flexShrink:0 }}>{messages.length} msgs</div>
        </div>

        {/* Messages list */}
        <div style={{ flex:1, overflowY:"auto", padding: isMobile ? "14px 12px" : "20px 24px", display:"flex", flexDirection:"column", gap:4 }}>
          {messages.length === 0 && (
            <div style={{ margin:"auto", textAlign:"center", opacity:0.5 }}>
              <div style={{ fontSize:40, marginBottom:10 }}>{activeTab.type === "channel" ? "👋" : "✉️"}</div>
              <div style={{ fontFamily:G.ff, color:"#fff", fontSize:16, fontWeight:600 }}>No messages yet</div>
              <div style={{ fontFamily:G.ff, color:"#fff", fontSize:13 }}>Be the first to say hello!</div>
            </div>
          )}
          {messages.map((m, i) => {
            const isMe = m.isMe || m.author === user.name;
            const prevSameAuthor = i > 0 && messages[i-1].author === m.author && !messages[i-1].isMe && !m.isMe;
            return (
              <div key={m.id} style={{ display:"flex", gap:12, marginTop: prevSameAuthor ? 0 : 12, animation:"fadeIn .3s ease" }}>
                <div style={{ width:36, flexShrink:0, display:"flex", justifyContent:"center" }}>
                  {!prevSameAuthor && (
                    <div style={{ width:36, height:36, borderRadius:"50%", border: isMe ? "1px solid rgba(255,204,51,.4)" : "1px solid rgba(255,255,255,.2)", overflow:"hidden" }}>
                      <img src={m.avatar || (isMe ? user.avatar : users.find(u=>u.name===m.author)?.avatar)} alt={m.author} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    </div>
                  )}
                </div>
                <div style={{ minWidth:0, flex:1 }}>
                  {!prevSameAuthor && (
                    <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:2 }}>
                      <span style={{ fontFamily:G.ff, color: isMe ? G.gold : "#fff", fontSize:14, fontWeight:700 }}>{isMe ? "You" : m.author}</span>
                      <span style={{ fontFamily:G.ff, color:"rgba(255,255,255,.3)", fontSize:11 }}>{m.time}</span>
                    </div>
                  )}
                  {m.text && (
                    <div style={{ fontFamily:G.ff, color:"rgba(255,235,215,.9)", fontSize:14.5, lineHeight:1.5, wordBreak:"break-word" }}>
                      {m.text}
                    </div>
                  )}
                  {/* Media Attachment Rendering */}
                  {m.attachment && (
                    <div style={{ marginTop: 8, maxWidth: isMobile ? "100%" : 400 }}>
                      {m.attachment.type === "image" ? (
                        <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,204,51,.2)", boxShadow:"0 4px 12px rgba(0,0,0,.2)", background:"rgba(0,0,0,.2)" }}>
                          <img src={m.attachment.data} alt="Attached image" style={{ width:"100%", maxHeight:300, objectFit:"contain", display:"block" }} />
                        </div>
                      ) : (
                        <div style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.15)", borderRadius:10, padding:"12px 16px" }}>
                          <div style={{ fontSize:24 }}>📄</div>
                          <div style={{ minWidth:0, flex:1 }}>
                            <div style={{ fontFamily:G.ff, color:"#fff", fontSize:13, fontWeight:600, textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{m.attachment.name}</div>
                            <div style={{ fontFamily:G.ff, color:"rgba(255,255,255,.4)", fontSize:11, marginTop:2 }}>{m.attachment.size}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} style={{ height:1 }} />
        </div>

        {/* Input area */}
        <div style={{ padding: isMobile ? "8px 10px" : "16px 24px", background:"linear-gradient(0deg, rgba(15,0,4,.8), rgba(15,0,4,.4))", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderTop:"1px solid rgba(255,255,255,.08)" }}>
          
          {/* Attachment Preview (Drafting stage) */}
          {attachment && (
            <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,204,51,.1)", border:"1px solid rgba(255,204,51,.3)", borderRadius:8, padding:"8px 12px", marginBottom:10, width:"max-content", maxWidth:"100%" }}>
               <span style={{ fontSize:18 }}>{attachment.type==="image" ? "🖼️" : "📄"}</span>
               <div style={{ fontFamily:G.ff, color:"#fff", fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>{attachment.name}</div>
               <button onClick={()=>setAttachment(null)} style={{ background:"none", border:"none", color:"rgba(255,255,255,.6)", cursor:"pointer", fontSize:14, marginLeft:4 }}>✕</button>
            </div>
          )}

          <div style={{ display:"flex", alignItems:"flex-end", gap:8, ...G.glassDark, borderRadius:24, padding:"6px 6px 6px 16px", border:"1px solid rgba(255,255,255,.15)" }}>
            
            {/* File Upload Button */}
            <button onClick={()=>fileRef.current?.click()} style={{ background:"none", border:"none", color:"rgba(255,204,51,.8)", fontSize:20, padding:"6px 4px", cursor:"pointer", flexShrink:0, alignSelf:"center" }}>
              📎
            </button>
            <input ref={fileRef} type="file" style={{ display:"none" }} onChange={handleFileSelect} />

            <textarea 
              value={draft} onChange={e=>setDraft(e.target.value)} 
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}}}
              placeholder={`Message ${activeTab.type === "channel" ? `#${activeChannelObj?.name}` : activeDMUser?.name}...`}
              rows={1}
              style={{ flex:1, background:"transparent", border:"none", color:"#fff", fontFamily:G.ff, fontSize:14, resize:"none", outline:"none", padding:"10px 0", maxHeight:120 }}
            />
            {uploading ? (
              <div style={{ fontFamily:G.ff, color:G.gold, fontSize:12, padding:"10px", alignSelf:"center" }}>Loading...</div>
            ) : (
              <button onClick={sendMessage} disabled={!draft.trim() && !attachment} style={{ ...G.btn, padding:"8px 16px", borderRadius:18, fontSize:14, color:"#3a0008", flexShrink:0, opacity: (!draft.trim() && !attachment) ? 0.5 : 1 }}>
                Send
              </button>
            )}
          </div>
          <div style={{ textAlign:"right", marginTop:6, fontFamily:G.ff, color:"rgba(255,255,255,.3)", fontSize:10 }}>Press Enter to send</div>
        </div>

        {/* Modals for Create Channel / New DM relative to chat area to prevent root-level clutter */}
        {showCreateChannel && (
          <div style={{ position:"absolute", inset:0, zIndex:100, background:"rgba(0,0,0,.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={()=>setShowCreateChannel(false)}>
            <div style={{ ...G.glass, width:"100%", maxWidth:400, padding:24 }} onClick={e=>e.stopPropagation()}>
              <h3 style={{ fontFamily:G.ff, color:"#fff", margin:"0 0 16px" }}>Create New Channel</h3>
              <input value={newChannelName} onChange={e=>setNewChannelName(e.target.value)} placeholder="Channel Name (e.g. graphics-api)" style={{ width:"100%", padding:"10px 14px", borderRadius:8, background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", color:"#fff", fontFamily:G.ff, marginBottom:12, boxSizing:"border-box", outline:"none" }} />
              <input value={newChannelDesc} onChange={e=>setNewChannelDesc(e.target.value)} placeholder="Description (optional)" style={{ width:"100%", padding:"10px 14px", borderRadius:8, background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", color:"#fff", fontFamily:G.ff, marginBottom:12, boxSizing:"border-box", outline:"none" }} />
              <div style={{ display:"flex", gap:10, marginBottom:20 }}>
                {["💬","🎨","💻","🧩","🎮","🎓"].map(icon => (
                  <div key={icon} onClick={()=>setNewChannelIcon(icon)} style={{ padding:8, borderRadius:8, background: newChannelIcon === icon ? "rgba(255,204,51,.2)" : "rgba(255,255,255,.05)", border: newChannelIcon === icon ? `1px solid ${G.gold}` : "1px solid transparent", cursor:"pointer", transition:"all .1s" }}>{icon}</div>
                ))}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={createChannel} style={{ ...G.btn, flex:1, padding:"10px", color:"#3a0008" }}>Create</button>
                <button onClick={()=>setShowCreateChannel(false)} style={{ 
                  ...G.btn, flex:1, padding:"10px", color:"#fff", 
                  background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,0.25)",
                  backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)"
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showNewDM && (
          <div style={{ position:"absolute", inset:0, zIndex:100, background:"rgba(0,0,0,.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={()=>setShowNewDM(false)}>
            <div style={{ ...G.glass, width:"100%", maxWidth:400, padding:24, maxHeight:"80vh", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
              <h3 style={{ fontFamily:G.ff, color:"#fff", margin:"0 0 16px" }}>Start Direct Message</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>
                {users.filter(u => u.x500 !== user.x500).map(u => (
                  <button key={u.x500} onClick={()=>startDM(u)} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:8, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", color:"#fff", cursor:"pointer", textAlign:"left" }}>
                    <div style={{ fontSize:18 }}>{u.emoji}</div>
                    <div>
                      <div style={{ fontFamily:G.ff, fontSize:14, fontWeight:600 }}>{u.name}</div>
                      <div style={{ fontFamily:G.ff, fontSize:12, color:"rgba(255,255,255,.5)" }}>{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowNewDM(false)} style={{ 
                ...G.btn, marginTop:16, width:"100%", color:"#fff", 
                background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,0.25)",
                backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)"
              }}>Cancel</button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
