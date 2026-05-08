import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AssetIcon, type AssetIconName } from "../components/AssetIcon";
import { getUsers } from "../api/users";
import { getImageUrl } from "../api/http";
import groupPhoto from "../assets/group_photo.jpeg";
import { User } from "../types";

interface InfoCard {
    icon: AssetIconName;
    title: string;
    info: string;
    sub: string;
}

export function AboutPage() {
    const navigate = useNavigate();

    const { data: members = [], isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const infoCards: InfoCard[] = [
        {
            icon: "calendar",
            title: "Weekly Meetings",
            info: "Every Monday, 5:00 PM",
            sub: "Keller Hall 3-125",
        },
        {
            icon: "discord",
            title: "Discord",
            info: "discord.com/invite/WGcvv2zc64",
            sub: "Ask questions anytime",
        },
    ];

    return (
        <div className="min-h-screen max-w-[1000px] mx-auto px-[clamp(16px,4vw,32px)] pt-[clamp(32px,5vw,48px)] pb-16 animate-[fadeUp_.6s_ease_both]">
            <h1
                className="font-ui font-bold text-white m-0 mb-1"
                style={{
                    fontSize: "clamp(26px,4vw,48px)",
                    textShadow: "0 2px 24px rgba(255,204,51,.4)",
                }}
            >
                About Us
            </h1>
            <div
                className="w-[60px] h-[3px] mb-2.5 rounded-sm"
                style={{ background: "linear-gradient(90deg,#FFCC33,transparent)" }}
            />

            <p className="font-ui mb-9 text-[15px]" style={{ color: "rgba(255,225,195,.6)" }}>
                Minnesota's home for computer graphics enthusiasts
            </p>

            {/* Group Photo */}
            <div className="flex justify-center mb-8">
                <img
                    src={groupPhoto}
                    alt="Gopher Graphics Group Photo"
                    className="rounded-xl shadow-lg max-w-full max-h-[400px] border-4 border-gold"
                    style={{ objectFit: "cover", background: "#fffbe6" }}
                />
            </div>

            {/* Mission */}
            <div
                className="glass mb-7"
                style={{
                    padding: "clamp(22px,4vw,36px)",
                    backgroundImage:
                        "linear-gradient(135deg, rgba(122,0,25,.2), rgba(180,100,0,.08))",
                }}
            >
                <div className="shine-bar" />
                <h2 className="font-ui text-gold text-[22px] mb-3.5 relative">Our Goal</h2>
                <p
                    className="font-ui text-[15px] leading-[1.75] m-0 relative"
                    style={{ color: "rgba(255,230,210,.84)" }}
                >
                    The Gopher Graphics Club is a community for graduate and undergraduate students
                    passionate about computer graphics, VR, 3D modeling, and animation. Through
                    hands-on workshops, project competitions, and collaborative discussions, we
                    explore the creative and technical sides of graphics. Whether you're just
                    curious or very passionate, all skill and interest levels are welcome!
                </p>
            </div>

            {/* Info cards */}
            <div
                className="grid gap-5 mb-7"
                style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}
            >
                {infoCards.map((item, i) => (
                    <div
                        key={i}
                        className="glass-card p-[clamp(22px,4vw,28px)] transition-[transform,box-shadow] duration-200"
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow =
                                "0 6px 32px rgba(80,0,15,0.22),0 1.5px 0 rgba(255,255,255,0.65) inset,0 0 20px rgba(255,204,51,0.3)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = "";
                            e.currentTarget.style.boxShadow = "";
                        }}
                    >
                        <div className="shine-bar" />
                        <AssetIcon name={item.icon} size={28} className="mb-2.5 relative" />
                        <h3 className="font-ui text-white font-bold text-base mb-1.5 relative">
                            {item.title}
                        </h3>
                        <p
                            className="font-ui font-semibold text-[15px] mb-1 relative"
                            style={{ color: "rgba(255,235,195,.88)" }}
                        >
                            {item.info}
                        </p>
                        <p
                            className="font-ui text-[12px] m-0 relative"
                            style={{ color: "rgba(255,215,170,.5)" }}
                        >
                            {item.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Members */}
            <div className="glass mb-7 p-[clamp(22px,4vw,30px)]">
                <div className="shine-bar" />
                <h2 className="font-ui text-gold text-xl mb-[22px] relative">
                    Officers &amp; Members
                </h2>
                {isLoading ? (
                    <div className="font-ui text-white/40 text-sm text-center py-8">
                        Loading members...
                    </div>
                ) : members.length === 0 ? (
                    <div className="font-ui text-white/40 text-sm text-center py-8">
                        No members yet.
                    </div>
                ) : (
                    <div
                        className="grid gap-3.5 relative"
                        style={{ gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))" }}
                    >
                        {members.map((m, i) => (
                            <button
                                key={m.id ?? i}
                                onClick={() => navigate(`/user/${m.username}`)}
                                className="rounded-[14px] py-[18px] px-3.5 text-center transition-all duration-200 cursor-pointer block w-full outline-none text-left"
                                style={{
                                    background: "rgba(255,255,255,.06)",
                                    border: "1px solid rgba(255,204,51,.15)",
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.background = "rgba(255,204,51,.1)";
                                    e.currentTarget.style.borderColor = "rgba(255,204,51,.4)";
                                    e.currentTarget.style.boxShadow =
                                        "0 0 20px rgba(255,204,51,0.3)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = "";
                                    e.currentTarget.style.background = "rgba(255,255,255,.06)";
                                    e.currentTarget.style.borderColor = "rgba(255,204,51,.15)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <div
                                    className="w-[42px] h-[42px] rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center font-ui font-bold text-sm text-gold"
                                    style={{
                                        background: "rgba(122,0,25,.45)",
                                        border: "1.5px solid rgba(255,204,51,.3)",
                                    }}
                                >
                                    {m.avatar_url ? (
                                        <img
                                            src={getImageUrl(m.avatar_url)}
                                            alt={m.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        m.name
                                            .split(" ")
                                            .map((w) => w[0])
                                            .join("")
                                    )}
                                </div>
                                <div className="font-ui text-white text-[13px] font-bold">
                                    {m.name}
                                </div>
                                <div
                                    className="font-ui text-[11px] mt-0.5 text-center"
                                    style={{ color: "rgba(255,204,51,.65)" }}
                                >
                                    {m.role}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
