import {
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaFacebook,
  FaDiscord,
  FaYoutube,
  FaTiktok,
  FaReddit,
  FaWeixin,
  FaGlobe,
} from "react-icons/fa";
import { SiXiaohongshu } from "react-icons/si";
import { SiX } from "react-icons/si";
import { MdGroups } from "react-icons/md";
import { IconType } from "react-icons/lib";

export type LinkType =
  | "linkedin"
  | "github"
  | "instagram"
  | "facebook"
  | "discord"
  | "discord-server"
  | "x"
  | "youtube"
  | "website"
  | "tiktok"
  | "reddit"
  | "wechat"
  | "xiaohongshu";

export type LinkItem = {
  id: string;
  type: LinkType;
  details: string;
};

interface LinkDetails {
  icon: IconType;
  label: string;
}

export const LinkTypes: { [key in LinkType]: LinkDetails } = {
  linkedin: { icon: FaLinkedin, label: "LinkedIn" },
  github: { icon: FaGithub, label: "GitHub" },
  instagram: { icon: FaInstagram, label: "Instagram" },
  facebook: { icon: FaFacebook, label: "Facebook" },
  discord: { icon: FaDiscord, label: "Discord" },
  "discord-server": { icon: MdGroups, label: "Discord Server" },
  x: { icon: SiX, label: "X" },
  youtube: { icon: FaYoutube, label: "YouTube" },
  website: { icon: FaGlobe, label: "Website" },
  tiktok: { icon: FaTiktok, label: "TikTok" },
  reddit: { icon: FaReddit, label: "Reddit" },
  wechat: { icon: FaWeixin, label: "WeChat" },
  xiaohongshu: { icon: SiXiaohongshu, label: "Xiaohongshu" },
};
