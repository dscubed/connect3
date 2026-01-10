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
  pattern?: LinkPattern;
}

interface LinkPattern {
  regex: RegExp[];
  prefix: string;
}

export const LinkTypes: { [key in LinkType]: LinkDetails } = {
  linkedin: {
    icon: FaLinkedin,
    label: "LinkedIn",
    pattern: {
      regex: [/^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^/?#]+)/i],
      prefix: "https://www.linkedin.com/in/",
    },
  },
  github: {
    icon: FaGithub,
    label: "GitHub",
    pattern: {
      regex: [/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)/i],
      prefix: "https://www.github.com/",
    },
  },
  instagram: {
    icon: FaInstagram,
    label: "Instagram",
    pattern: {
      regex: [/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#]+)/i],
      prefix: "https://www.instagram.com/",
    },
  },
  facebook: {
    icon: FaFacebook,
    label: "Facebook",
    pattern: {
      regex: [/^(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^/?#]+)/i],
      prefix: "https://www.facebook.com/",
    },
  },
  discord: {
    icon: FaDiscord,
    label: "Discord",
  },
  "discord-server": {
    icon: MdGroups,
    label: "Discord Server",
    pattern: {
      regex: [/^(?:https?:\/\/)?(?:www\.)?discord\.gg\/([^/?#]+)/i],
      prefix: "https://discord.gg/",
    },
  },
  x: {
    icon: SiX,
    label: "X",
    pattern: {
      regex: [/^(?:https?:\/\/)?(?:www\.)?x\.com\/([^/?#]+)/i],
      prefix: "https://x.com/",
    },
  },
  youtube: {
    icon: FaYoutube,
    label: "YouTube",
    pattern: {
      regex: [/^(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([^/?#]+)/i],
      prefix: "https://www.youtube.com/@",
    },
  },
  website: { icon: FaGlobe, label: "Website" },
  tiktok: {
    icon: FaTiktok,
    label: "TikTok",
    pattern: {
      regex: [/^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^/?#]+)/i],
      prefix: "https://www.tiktok.com/@",
    },
  },
  reddit: {
    icon: FaReddit,
    label: "Reddit",
    pattern: {
      regex: [
        /^(?:https?:\/\/)?(?:www\.)?reddit\.com\/user\/([^/?#]+)/i,
        /^(?:https?:\/\/)?(?:www\.)?reddit\.com\/u\/([^/?#]+)/i,
      ],
      prefix: "https://www.reddit.com/u/",
    },
  },
  wechat: { icon: FaWeixin, label: "WeChat" },
  xiaohongshu: { icon: SiXiaohongshu, label: "Xiaohongshu" },
};

export const UrlToLinkDetails = (
  url: string
): { type: LinkType; details: string } | null => {
  for (const [type, details] of Object.entries(LinkTypes)) {
    const pattern = details.pattern;
    if (pattern) {
      for (const regex of pattern.regex) {
        const match = url.match(regex);
        if (match && match[1]) {
          return { type: type as LinkType, details: match[1] };
        }
      }
    }
  }
  return null;
};
