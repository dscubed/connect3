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
import { toast } from "sonner";
import { SupabaseClient } from "@supabase/supabase-js";

export type LinkType =
  | "linkedin-user"
  | "linkedin-company"
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
  "linkedin-user": {
    icon: FaLinkedin,
    label: "LinkedIn",
    pattern: {
      regex: [/^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^/?#]+)/i],
      prefix: "https://www.linkedin.com/in/",
    },
  },
  "linkedin-company": {
    icon: FaLinkedin,
    label: "LinkedIn",
    pattern: {
      regex: [/^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/company\/([^/?#]+)/i],
      prefix: "https://www.linkedin.com/company/",
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
  url: string,
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

// Supabase Link Utils

export const deleteLinksFromSupabase = async (
  ids: string[],
  supabase: SupabaseClient,
) => {
  if (ids.length === 0) return;
  console.log("Deleting links with IDs:", ids);

  const { error } = await supabase.from("profile_links").delete().in("id", ids);

  if (error) {
    console.error("Error deleting links:", error);
    toast.error(`Error deleting links: ${error.message}`);
  }
};

export const addLinksToSupabase = async (
  newLinks: LinkItem[],
  supabase: SupabaseClient,
  profileId: string,
) => {
  const { error } = await supabase.from("profile_links").insert(
    newLinks.map((link) => ({
      id: link.id,
      type: link.type,
      details: link.details,
      profile_id: profileId,
    })),
  );
  if (error) {
    console.error("Error adding links:", error);
    toast.error(`Error adding links: ${error.message}`);
  }
};

export const updateLinksInSupabase = async (
  updatedLinks: LinkItem[],
  supabase: SupabaseClient,
) => {
  for (const link of updatedLinks) {
    const { error } = await supabase
      .from("profile_links")
      .update({ details: link.details })
      .eq("id", link.id);
    if (error) {
      console.error("Error updating link:", error);
      toast.error(`Error updating link: ${error.message}`);
    }
  }
};
