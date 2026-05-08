import type { CSSProperties } from "react";

import calenderIcon from "../assets/svg/calender.svg";
import competitionIcon from "../assets/svg/competition.svg";
import discordIcon from "../assets/svg/discord.svg";
import githubIcon from "../assets/svg/github.svg";
import labIcon from "../assets/svg/lab.svg";
import mailIcon from "../assets/svg/mail.svg";
import medalIcon from "../assets/svg/medal.svg";
import messageIcon from "../assets/svg/message.svg";
import networkIcon from "../assets/svg/network.svg";
import pictureIcon from "../assets/svg/picture.svg";
import projectIcon from "../assets/svg/project.svg";
import showcaseIcon from "../assets/svg/showcase.svg";
import starIcon from "../assets/svg/star.svg";

const ICONS = {
  calendar: calenderIcon,
  competition: competitionIcon,
  discord: discordIcon,
  github: githubIcon,
  lab: labIcon,
  mail: mailIcon,
  medal: medalIcon,
  message: messageIcon,
  network: networkIcon,
  picture: pictureIcon,
  project: projectIcon,
  showcase: showcaseIcon,
  star: starIcon,
} as const;

export type AssetIconName = keyof typeof ICONS;

interface AssetIconProps {
  name: AssetIconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export function AssetIcon({ name, size = 20, className = "", style, title }: AssetIconProps) {
  return (
    <div
      className={`icon-badge ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        padding: 0,
        ...style,
      }}
      aria-hidden={title ? undefined : true}
      title={title}
    >
      <img
        src={ICONS[name]}
        alt=""
        className="w-[64%] h-[64%] object-contain"
        style={{ filter: "brightness(0) saturate(1) invert(1) sepia(0.8) hue-rotate(40deg) brightness(0.9)" }}
      />
    </div>
  );
}