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

export interface AddingState {
  typeInput: string;
  type?: LinkType;
  details: string;
}

interface LinkDetails {
  icon: IconType;
  label: string;
  regex?: RegExp;
}

export const LinkTypes: { [key in LinkType]: LinkDetails } = {
  linkedin: {
    icon: FaLinkedin,
    label: "LinkedIn",
    regex: /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^/?#]+)/i,
  },
  github: {
    icon: FaGithub,
    label: "GitHub",
    regex: /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)/i,
  },
  instagram: {
    icon: FaInstagram,
    label: "Instagram",
    regex: /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#]+)/i,
  },
  facebook: {
    icon: FaFacebook,
    label: "Facebook",
    regex: /^(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^/?#]+)/i,
  },
  discord: {
    icon: FaDiscord,
    label: "Discord",
  },
  "discord-server": {
    icon: MdGroups,
    label: "Discord Server",
    regex: /^(?:https?:\/\/)?(?:www\.)?discord\.gg\/([^/?#]+)/i,
  },
  x: {
    icon: SiX,
    label: "X",
    regex: /^(?:https?:\/\/)?(?:www\.)?x\.com\/([^/?#]+)/i,
  },
  youtube: {
    icon: FaYoutube,
    label: "YouTube",
    regex: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([^/?#]+)/i,
  },
  website: { icon: FaGlobe, label: "Website" },
  tiktok: {
    icon: FaTiktok,
    label: "TikTok",
    regex: /^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^/?#]+)/i,
  },
  reddit: {
    icon: FaReddit,
    label: "Reddit",
    regex: /^(?:https?:\/\/)?(?:www\.)?reddit\.com\/u\/([^/?#]+)/i,
  },
  wechat: { icon: FaWeixin, label: "WeChat" },
  xiaohongshu: { icon: SiXiaohongshu, label: "Xiaohongshu" },
};
