import avatar1 from "../assets/avatars/1.jpeg";
import avatar2 from "../assets/avatars/2.jpeg";
import avatar3 from "../assets/avatars/3.jpeg";
import avatar4 from "../assets/avatars/4.jpeg";
import avatar5 from "../assets/avatars/5.jpeg";
import avatar6 from "../assets/avatars/6.jpeg";
import avatar7 from "../assets/avatars/7.jpeg";
import avatar8 from "../assets/avatars/8.jpeg";
import avatar9 from "../assets/avatars/9.jpeg";
import avatar10 from "../assets/avatars/10.jpeg";
import avatar11 from "../assets/avatars/11.jpeg";
import avatar12 from "../assets/avatars/12.jpeg";
import avatar13 from "../assets/avatars/13.jpeg";
import avatar14 from "../assets/avatars/14.jpeg";
import avatar15 from "../assets/avatars/15.jpeg";
import avatar16 from "../assets/avatars/16.jpeg";
import avatar17 from "../assets/avatars/17.jpeg";
import avatar18 from "../assets/avatars/18.jpeg";

export const DEFAULT_AVATARS = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
  avatar11,
  avatar12,
  avatar13,
  avatar14,
  avatar15,
  avatar16,
  avatar17,
  avatar18,
];

/** Preset used for new sign-ups and when an avatar URL is not one of the defaults. */
export const defaultSignupAvatar = avatar7;

export function pickDefaultAvatar(current: string | undefined): string {
  if (current && DEFAULT_AVATARS.some((a) => a === current)) return current;
  return defaultSignupAvatar;
}
