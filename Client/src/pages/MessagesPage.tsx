import { useState, useRef, useEffect, ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { getChannels, getChannelMessages, joinChannel, leaveChannel, postChannelMessage, createChannel, deleteChannelMessage } from "../api/channels";
import { getImageUrl } from "../api/http";
import { compressImage } from "../util/image";
import { AssetIcon } from "../components/AssetIcon";
import { getDirectMessages, sendDirectMessage, deleteDirectMessage, getConversations } from "../api/directMessages";
import { getUsers, getUserById } from "../api/users";
import { pickDefaultAvatar } from "../constants/defaultAvatars";
import { User, Channel, Message } from "../types";

type TabType = { type: "channel" | "dm"; id: string };

interface Attachment {
  type: "image";
  data: string;
  name: string;
}

export function MessagesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // init tab from url if present
  const initialType = searchParams.get("type") as "channel" | "dm" | null;
  const initialId   = searchParams.get("id");
  
  const [activeTab, setActiveTab]           = useState<TabType>(
    initialType && initialId ? { type: initialType, id: initialId } : { type: "channel", id: "general" }
  );

  // sync activeTab with url
  useEffect(() => {
    if (initialType && initialId && (activeTab.type !== initialType || activeTab.id !== initialId)) {
      setActiveTab({ type: initialType, id: initialId });
    }
  }, [initialType, initialId]);

  const [draft, setDraft]                   = useState("");
  const [showSidebar, setShowSidebar]       = useState(false);
  const [isMobile, setIsMobile]             = useState(false);
  
  // modals
  const [showBrowseChannels, setShowBrowseChannels] = useState(false);
  const [showNewChannel, setShowNewChannel]         = useState(false);
  const [showNewDM, setShowNewDM]                   = useState(false);
  
  // new channel form
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  
  // message composing
  const fileRef  = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment]         = useState<Attachment | null>(null);
  const [uploading, setUploading]           = useState(false);
  const [replyingTo, setReplyingTo]         = useState<Message | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // fetch channels
  const { data: channels = [] } = useQuery({
    queryKey: ["channels"],
    queryFn: getChannels,
  });

  // fetch all users for dm picker
  const { data: allUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // fetch active dm conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    refetchInterval: 5000,
  });

  // fetch specific user details for the active dm
  const { data: activeDMUserData } = useQuery({
    queryKey: ["user-dm", activeTab.id],
    queryFn: () => getUserById(activeTab.id),
    enabled: activeTab.type === "dm" && !!activeTab.id,
  });

  // fetch messages for active tab with infinite scroll
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["messages", activeTab.type, activeTab.id],
    queryFn: ({ pageParam }) => {
      const options = pageParam ? { before: pageParam as string } : {};
      return activeTab.type === "channel"
        ? getChannelMessages(activeTab.id, 15, options)
        : getDirectMessages(activeTab.id, 15, options);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 15) return undefined;
      // lastPage is already reversed by backend, so lastPage[0] is the oldest in this batch
      return lastPage[0]?.created_at;
    },
    enabled: !!activeTab.id,
    refetchInterval: 3000, // Poll for newest batch
  });

  const messages = infiniteData ? infiniteData.pages.flat().sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) : [];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Handle scroll for infinite loading
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // If at the top, fetch older messages
    if (el.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      // Save height to maintain scroll position
      const previousHeight = el.scrollHeight;
      fetchNextPage().then(() => {
        // After loading, adjust scroll so we stay at the same message
        setTimeout(() => {
          if (scrollContainerRef.current) {
            const newHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop = newHeight - previousHeight;
          }
        }, 0);
      });
    }

    // Check if user is near bottom
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
    setShouldScrollToBottom(isAtBottom);
  };

  useEffect(() => {
    if (shouldScrollToBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldScrollToBottom]);
  // derived state
  const joinedChannels = channels.filter(c => c.is_member);
  
  const activeChannelObj = activeTab.type === "channel" ? channels.find(c => c.slug === activeTab.id) : null;
  
  const convUser = conversations.find(c => c.partner_id === activeTab.id);
  const activeDMUser = activeTab.type === "dm" 
    ? (convUser ? { id: convUser.partner_id, name: convUser.name, avatar_url: convUser.avatar_url } : (allUsers.find(u => u.id === activeTab.id) || activeDMUserData)) 
    : null;

  // mutations
  const joinMutation = useMutation({
    mutationFn: joinChannel,
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["messages", "channel", slug] });
    }
  });

  const leaveMutation = useMutation({
    mutationFn: leaveChannel,
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      if (activeTab.type === "channel" && activeTab.id === slug) {
        setActiveTab({ type: "channel", id: "general" });
      }
    }
  });

  const createChannelMutation = useMutation({
    mutationFn: createChannel,
    onSuccess: (newChannel) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      setActiveTab({ type: "channel", id: newChannel.slug });
      setShowNewChannel(false);
      setNewChannelName("");
      setNewChannelDesc("");
      setShowSidebar(false);
    }
  });

  const sendMsgMutation = useMutation({
    mutationFn: (data: { text?: string, image_data?: string, parent_id?: string }) => 
      activeTab.type === "channel" 
        ? postChannelMessage(activeTab.id, data)
        : sendDirectMessage({ receiver_id: activeTab.id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeTab.type, activeTab.id] });
      setDraft(""); setAttachment(null); setReplyingTo(null);
    }
  });

  const deleteMsgMutation = useMutation({
    mutationFn: (messageId: string) =>
      activeTab.type === "channel"
        ? deleteChannelMessage(activeTab.id, messageId)
        : deleteDirectMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", activeTab.type, activeTab.id] });
    }
  });

  if (!user) return null;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        try {
          const compressed = await compressImage(result, 1200, 1200, 0.7);
          setAttachment({ type:"image", data:compressed, name:file.name });
        } catch (err) {
          console.error("Compression failed:", err);
          setAttachment({ type:"image", data:result, name:file.name });
        }
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text && !attachment) return;
    sendMsgMutation.mutate({ 
      text, 
      image_data: attachment?.data,
      parent_id: replyingTo?.id 
    });
  }

  // shared sidebar jsx
  const sidebarContent = (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Channels */}
      <div className="px-3 pt-2.5 pb-1 mb-1">
        <div className="flex justify-between items-center">
          <div className="font-ui text-gold text-[12px] font-bold tracking-[0.06em] uppercase opacity-80">Channels</div>
          <div className="flex gap-2.5 items-center">
            <button onClick={() => setShowBrowseChannels(true)} className="text-gold text-[12px] font-ui underline opacity-80">Browse</button>
            <button onClick={() => setShowNewChannel(true)} className="text-gold text-base font-ui leading-none" title="Create Channel">+</button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        {joinedChannels.map(c => {
          const active = activeTab.type === "channel" && activeTab.id === c.slug;
          return (
            <button key={c.id} onClick={() => { setActiveTab({type:"channel",id:c.slug}); setShowSidebar(false); }}
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
      <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 min-h-0">
        {conversations.map(conv => {
          const active = activeTab.type === "dm" && activeTab.id === conv.partner_id;
          return (
            <button key={conv.partner_id} 
              onClick={() => { setActiveTab({ type:"dm", id: conv.partner_id }); setShowSidebar(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md border-none text-left transition-all duration-100 group"
              style={{ background: active ? "rgba(255,204,51,.12)" : "transparent" }}>
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0" style={{ border: active ? "1.5px solid #FFCC33" : "1.5px solid rgba(255,255,255,.1)" }}>
                <img src={getImageUrl(pickDefaultAvatar(conv.avatar_url))} alt={conv.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-ui text-[13px] truncate" style={{ color: active ? "#FFCC33" : "rgba(255,225,195,.7)", fontWeight: active ? 600 : 400 }}>{conv.name}</div>
                <div className="font-ui text-[10px] truncate opacity-40" style={{ color: active ? "#FFCC33" : "white" }}>{conv.last_message || "No messages"}</div>
              </div>
            </button>
          );
        })}
        {conversations.length === 0 && !activeDMUser && (
          <div className="px-3 py-4 text-center opacity-30 font-ui text-[11px]">No active conversations</div>
        )}
        {activeTab.type === "dm" && !conversations.find(c => c.partner_id === activeTab.id) && (
            <button key={activeTab.id} onClick={() => setShowSidebar(false)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md border-none text-left transition-all duration-100"
              style={{ background: "rgba(255,204,51,.12)" }}>
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0" style={{ border: "1.5px solid #FFCC33" }}>
                <img src={getImageUrl(pickDefaultAvatar(activeDMUser?.avatar_url))} alt={activeDMUser?.name || "User"} className="w-full h-full object-cover" />
              </div>
              <div className="font-ui text-[13px] truncate" style={{ color: "#FFCC33", fontWeight: 600 }}>{activeDMUser?.name || "DM"}</div>
            </button>
        )}
      </div>

      {/* User footer */}
      <div className="mt-auto px-2.5 pt-3 pb-1 flex items-center gap-2.5 flex-shrink-0" style={{ borderTop:"1px solid rgba(255,204,51,.1)" }}>
        <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0" style={{ border:"2px solid rgba(255,204,51,.35)" }}>
          <img src={getImageUrl(pickDefaultAvatar(user.avatar_url))} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="font-ui text-white text-[13px] font-semibold truncate">{user.name}</div>
          <div className="font-ui text-gold text-[11px] opacity-65 truncate">{user.role}</div>
        </div>
      </div>
    </div>
  );

  // modal wrapper helper
  const modalOverlay = (onClose: () => void, children: ReactNode) => (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,.6)", backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div className="glass w-full max-w-[400px] p-6" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden" style={{ boxSizing:"border-box" }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="flex-shrink-0 flex flex-col py-2 px-2 pb-4 min-h-0 overflow-hidden" style={{ width:240, borderRight:"1px solid rgba(255,255,255,.12)", background:"linear-gradient(180deg, rgba(30,0,8,.5), rgba(15,0,4,.6))", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" }}>
          {sidebarContent}
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && showSidebar && (
        <div className="fixed top-[60px] inset-x-0 bottom-0 z-50 flex flex-col gap-1 px-3.5 pt-4 min-h-0 overflow-hidden animate-[fadeIn_.2s_ease_both]"
          style={{ background:"linear-gradient(180deg, rgba(25,0,8,.96), rgba(12,0,3,.98))", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)" }}>
          {sidebarContent}
          <button onClick={() => setShowSidebar(false)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg z-[60]"
            style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.1)" }}>✕</button>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden">

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
                <div className="font-ui text-white font-bold" style={{ fontSize: isMobile ? 14 : 16 }}>{activeChannelObj?.name || activeTab.id}</div>
                {!isMobile && <div className="font-ui text-[12px] truncate" style={{ color:"rgba(255,215,175,.5)" }}>{activeChannelObj?.description}</div>}
              </div>
              {activeChannelObj?.slug !== "general" && (
                <button onClick={() => leaveMutation.mutate(activeChannelObj?.slug || activeTab.id)} disabled={leaveMutation.isPending}
                  className="btn-ghost px-2.5 py-1 text-[11px] ml-2">Leave</button>
              )}
            </>
          ) : (
            <>
              <div className="rounded-full overflow-hidden" style={{ width: isMobile?24:32, height: isMobile?24:32, border:"1px solid rgba(255,255,255,0.2)" }}>
                <img src={getImageUrl(pickDefaultAvatar(activeDMUser?.avatar_url))} alt={activeDMUser?.name || "User"} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="font-ui text-white font-bold" style={{ fontSize: isMobile ? 14 : 16 }}>{activeDMUser?.name || activeTab.id}</div>
                {!isMobile && <div className="font-ui text-[12px]" style={{ color:"rgba(255,215,175,.5)" }}>Direct Message</div>}
              </div>
            </>
          )}
          <div className="ml-auto font-ui text-[12px] flex-shrink-0" style={{ color:"rgba(255,210,170,.35)" }}>{messages.length} msgs</div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-0" 
          style={{ padding: isMobile ? "14px 12px" : "20px 24px" }}>
          
          {isFetchingNextPage && (
            <div className="text-center py-4 font-ui text-[11px] text-gold/40 animate-pulse">Loading older messages...</div>
          )}
          {messages.length === 0 && !isLoading && (
            <div className="m-auto text-center opacity-50">
              <div className="font-ui text-white text-base font-semibold">No messages yet</div>
              <div className="font-ui text-white text-[13px]">Be the first to say hello!</div>
            </div>
          )}
          {messages.map((m: any, i: number) => {
            if (m.message_type === "system_join" || m.message_type === "system_leave") {
              const Icon = m.message_type === "system_join" ? "→" : "←";
              const color = m.message_type === "system_join" ? "rgba(100,255,100,.5)" : "rgba(255,100,100,.5)";
              return (
                <div key={m.id} className="flex items-center justify-center gap-2 my-2 animate-[fadeIn_.3s_ease]">
                  <span className="font-ui text-[14px] font-bold" style={{ color }}>{Icon}</span>
                  <span className="font-ui text-[12px]" style={{ color:"rgba(255,255,255,.4)" }}>
                    <strong style={{ color:"rgba(255,255,255,.7)" }}>{m.author_name}</strong> {m.message_type === "system_join" ? "hopped into the channel." : "left the channel."}
                  </span>
                </div>
              );
            }

            const isMe = (m.author_id ?? m.sender_id) === user.id;
            let prevSame = false;
            if (i > 0) {
              const prev = messages[i-1];
              const mIsUser = !m.message_type || m.message_type === "user";
              const prevIsUser = !prev.message_type || prev.message_type === "user";
              const mAuthor = m.author_id ?? m.sender_id;
              const prevAuthor = prev.author_id ?? prev.sender_id;
              if (prevIsUser && mIsUser && prevAuthor === mAuthor && !m.parent_id) {
                const timeDiff = new Date(m.created_at).getTime() - new Date(prev.created_at).getTime();
                if (timeDiff < 120000) prevSame = true;
              }
            }
            return (
              <div key={m.id}
                className="group/msg relative rounded-lg px-3 py-0.5 -mx-3 transition-colors duration-150"
                style={{ marginTop: prevSame ? 0 : 10 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {/* Hover action bar */}
                <div className="absolute -top-3 right-2 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150 z-10 flex rounded-md overflow-hidden"
                  style={{ border:"1px solid rgba(255,255,255,.1)", background:"rgba(20,0,6,.9)", backdropFilter:"blur(12px)", boxShadow:"0 4px 16px rgba(0,0,0,.4)" }}>
                  <button onClick={() => setReplyingTo(m)}
                    className="px-2.5 py-1.5 font-ui text-[11px] text-white/70 hover:text-white hover:bg-white/8 transition-colors duration-100"
                    title="Reply">↩ Reply</button>
                  {isMe && (
                    <button onClick={() => { if (confirm("Delete this message?")) deleteMsgMutation.mutate(m.id); }}
                      className="px-2.5 py-1.5 font-ui text-[11px] text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-100"
                      style={{ borderLeft:"1px solid rgba(255,255,255,.08)" }}
                      title="Delete">✕</button>
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="w-9 flex-shrink-0 flex justify-center pt-0.5">
                    {!prevSame ? (
                      <Link to={`/user/${m.author_username}`} className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0" style={{ border: isMe ? "1.5px solid rgba(255,204,51,.35)" : "1.5px solid rgba(255,255,255,.15)" }}>
                        <img src={getImageUrl(pickDefaultAvatar(m.author_avatar))} alt={m.author_name} className="w-full h-full object-cover" />
                      </Link>
                    ) : (
                      <span className="font-ui text-[10px] opacity-0 group-hover/msg:opacity-30 transition-opacity select-none pt-1" style={{color:"rgba(255,255,255,.5)"}}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {!prevSame && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <Link to={`/user/${m.author_username}`} className="font-ui font-bold text-[13.5px] hover:underline" style={{ color: isMe ? "#FFCC33" : "#fff" }}>{isMe ? "You" : m.author_name}</Link>
                        <span className="font-ui text-[11px]" style={{ color:"rgba(255,255,255,.25)" }}>
                          {new Date(m.created_at).toLocaleString([], { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
                        </span>
                      </div>
                    )}
                    {/* Reply context */}
                    {m.parent_id && (
                      <div className="flex items-start gap-0 mb-1 max-w-[85%]">
                        <div className="flex-shrink-0 w-4 h-4 mt-0.5" style={{ borderLeft:"2px solid rgba(255,204,51,.25)", borderTop:"2px solid rgba(255,204,51,.25)", borderRadius:"6px 0 0 0" }} />
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md min-w-0" style={{ background:"rgba(255,204,51,.04)" }}>
                          <span className="font-ui text-[11px] font-semibold flex-shrink-0" style={{ color:"rgba(255,204,51,.6)" }}>{m.parent_author_name || "Unknown"}</span>
                          <span className="font-ui text-[11px] truncate" style={{ color:"rgba(255,255,255,.35)" }}>
                            {m.parent_text || (m.parent_image ? "sent an image" : "message deleted")}
                          </span>
                        </div>
                      </div>
                    )}
                    {m.text && (
                      <div className="font-ui text-[14px] leading-[1.55] break-words whitespace-pre-wrap" style={{ color:"rgba(255,235,215,.88)" }}>{m.text}</div>
                    )}
                    {m.image_data && (
                      <div className="mt-1.5" style={{ maxWidth: isMobile ? "100%" : 380 }}>
                        <div className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,204,51,.15)", boxShadow:"0 4px 12px rgba(0,0,0,.2)", background:"rgba(0,0,0,.2)" }}>
                          <img src={getImageUrl(m.image_data)} alt="Attached image" className="w-full block" style={{ maxHeight:300, objectFit:"contain" }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} className="h-px" />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0" style={{ padding: isMobile ? "8px 10px" : "12px 24px", background:"linear-gradient(0deg, rgba(15,0,4,.85), rgba(15,0,4,.4))", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", borderTop:"1px solid rgba(255,255,255,.06)" }}>
          {replyingTo && (
            <div className="flex items-center gap-0 mb-2.5 animate-[fadeIn_.15s_ease]">
              <div className="w-[3px] rounded-full self-stretch flex-shrink-0" style={{ background:"linear-gradient(180deg, #FFCC33, rgba(255,204,51,.3))" }} />
              <div className="flex items-center justify-between flex-1 min-w-0 px-3 py-2 rounded-r-lg" style={{ background:"rgba(255,204,51,.05)", borderTop:"1px solid rgba(255,204,51,.08)", borderRight:"1px solid rgba(255,204,51,.08)", borderBottom:"1px solid rgba(255,204,51,.08)" }}>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="font-ui text-[11px] font-bold" style={{ color:"rgba(255,204,51,.75)" }}>
                    Replying to {replyingTo.author_id === user.id ? "yourself" : replyingTo.author_name}
                  </div>
                  <div className="font-ui text-[12px] truncate" style={{ color:"rgba(255,255,255,.4)" }}>
                    {replyingTo.text || (replyingTo.image_data ? "📷 Image" : "")}
                  </div>
                </div>
                <button onClick={() => setReplyingTo(null)}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors text-xs ml-2">✕</button>
              </div>
            </div>
          )}
          {attachment && (
            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 mb-2.5 w-max max-w-full" style={{ background:"rgba(255,204,51,.08)", border:"1px solid rgba(255,204,51,.2)" }}>
              <AssetIcon name="picture" size={16} />
              <div className="font-ui text-white/80 text-[12px] overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{attachment.name}</div>
              <button onClick={() => setAttachment(null)} className="w-5 h-5 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors text-[10px]">✕</button>
            </div>
          )}
          <div className="flex items-end gap-2 rounded-[22px] pl-3.5 pr-1.5 py-1" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", transition:"border-color .2s" }}
            onFocus={e => e.currentTarget.style.borderColor = "rgba(255,204,51,.25)"}
            onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"}>
            <button onClick={() => fileRef.current?.click()} className="flex-shrink-0 self-center w-7 h-7 flex items-center justify-center rounded-full text-gold/60 hover:text-gold hover:bg-white/5 transition-colors text-lg">+</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <textarea value={draft} onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Message ${activeTab.type==="channel" ? `#${activeChannelObj?.name || activeTab.id}` : activeDMUser?.name || "User"}…`}
              rows={1}
              className="flex-1 bg-transparent border-none text-white font-ui text-[13.5px] resize-none outline-none py-2.5 max-h-[120px]" style={{ color:"rgba(255,235,215,.9)" }} />
            {uploading || sendMsgMutation.isPending ? (
              <div className="font-ui text-gold text-[12px] px-2.5 py-2.5 self-center animate-pulse">Sending…</div>
            ) : (
              <button onClick={sendMessage} disabled={!draft.trim() && !attachment}
                className="btn-vista px-4 py-2 rounded-[18px] text-sm text-[#3a0008] flex-shrink-0 transition-opacity"
                style={{ opacity: !draft.trim() && !attachment ? 0.35 : 1 }}>
                Send
              </button>
            )}
          </div>
        </div>

        {/* Browse Channels modal */}
        {showBrowseChannels && modalOverlay(() => setShowBrowseChannels(false), (
          <>
            <h3 className="font-ui text-white m-0 mb-4">Browse Channels</h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
              {channels.filter(c => !c.is_member).map(c => (
                <div key={c.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg" style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)" }}>
                  <div className="min-w-0">
                    <div className="font-ui text-white text-sm font-semibold">#{c.name}</div>
                    <div className="font-ui text-[12px] truncate" style={{ color:"rgba(255,255,255,.5)" }}>{c.description}</div>
                  </div>
                  <button onClick={() => joinMutation.mutate(c.slug)} disabled={joinMutation.isPending} className="btn-vista px-3 py-1.5 text-[12px] text-[#3a0008] flex-shrink-0">Join</button>
                </div>
              ))}
              {channels.filter(c => !c.is_member).length === 0 && (
                <div className="font-ui text-center my-5" style={{ color:"rgba(255,255,255,.4)" }}>You have joined all available channels.</div>
              )}
            </div>
            <button onClick={() => setShowBrowseChannels(false)} className="btn-ghost w-full mt-4 py-2.5">Done</button>
          </>
        ))}

        {/* New DM modal */}
        {showNewDM && modalOverlay(() => setShowNewDM(false), (
          <>
            <h3 className="font-ui text-white m-0 mb-4">Start Direct Message</h3>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
              {allUsers.filter(u => u.id !== user?.id).map((u) => (
                <button key={u.id} onClick={() => { setActiveTab({ type:"dm", id: u.id }); setShowNewDM(false); setShowSidebar(false); }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-white text-left cursor-pointer border-none"
                  style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)" }}>
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm font-ui flex-shrink-0" style={{ background:"rgba(255,255,255,.1)" }}>
                    {u.avatar_url
                      ? <img src={getImageUrl(u.avatar_url)} alt={u.name} className="w-full h-full object-cover" />
                      : u.name.charAt(0)
                    }
                  </div>
                  <div>
                    <div className="font-ui text-sm font-semibold">{u.name}</div>
                    <div className="font-ui text-[12px]" style={{ color:"rgba(255,255,255,.5)" }}>{u.role}</div>
                  </div>
                </button>
              ))}
              {allUsers.filter(u => u.id !== user?.id).length === 0 && (
                <div className="font-ui text-center my-5" style={{ color:"rgba(255,255,255,.4)" }}>No other members yet.</div>
              )}
            </div>
            <button onClick={() => setShowNewDM(false)} className="btn-ghost w-full mt-4 py-2.5">Cancel</button>
          </>
        ))}

        {/* Create Channel modal */}
        {showNewChannel && modalOverlay(() => setShowNewChannel(false), (
          <>
            <h3 className="font-ui text-white m-0 mb-4">Create New Channel</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="label-gold text-[11px] mb-1 block">Channel Name</label>
                <input className="input-glass" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="e.g. game-dev" autoFocus />
              </div>
              <div>
                <label className="label-gold text-[11px] mb-1 block">Description (Optional)</label>
                <input className="input-glass" value={newChannelDesc} onChange={e => setNewChannelDesc(e.target.value)} placeholder="What's this channel about?" />
              </div>
              <div className="flex justify-end gap-3 w-full mt-2 relative">
                <button onClick={() => setShowNewChannel(false)} className="btn-ghost px-5 py-2.5 text-sm">Cancel</button>
                <button onClick={() => createChannelMutation.mutate({ name: newChannelName, description: newChannelDesc })}
                  disabled={createChannelMutation.isPending || !newChannelName.trim()}
                  className="btn-vista px-6 py-2.5 text-sm text-[#3a0008]">
                  {createChannelMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
