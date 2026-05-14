import React from "react";
import Avatar from "@mui/material/Avatar";

export type PlatformCode =
  | "FB"
  | "INSTA"
  | "LINKEDIN"
  | "TWITTER"
  | "YOUTUBE"
  | "WHATSAPP"
  | "GOOGLE_ADS"
  | "SEO"
  | "EMAIL"
  | "SMS"
  | "WEBSITE"
  | "REFERRAL"
  | "EVENT"
  | "WALKIN"
  | "MARKETPLACE"
  | "OTHERS"
  | "99_ACRES"
  | "MAGIC_BRICKS"
  | "HOUSING_COM";

interface PlatformAvatarProps {
  platformCode?: PlatformCode | string | null;
  size?: number;
  variant?: "circular" | "rounded" | "square";
  title?: string;
  showLabel?: boolean;
}

const iconMap: Record<string, string> = {
  FB: "/platform_icon/facebook.png",
  INSTA: "/platform_icon/instagram.png",
  LINKEDIN: "/platform_icon/linkedin.png",
  TWITTER: "/platform_icon/twitter.png",
  YOUTUBE: "/platform_icon/youtube.png",
  WHATSAPP: "/platform_icon/whatsapp.png",
  GOOGLE_ADS: "/platform_icon/google_ads.png",
  EMAIL: "/platform_icon/gmail.png",
  SMS: "/platform_icon/sms.png",
  WEBSITE: "/platform_icon/website.png",
  "99_ACRES": "/platform_icon/99_acers.png",
  MAGIC_BRICKS: "/platform_icon/magic_brick.png",
  HOUSING_COM: "/platform_icon/housing_com.png",
  COMMON_FLOOR: "/platform_icon/CommonFloor.png",
  EXCEL: "/platform_icon/excel.png",

  MAKAAN_COM: "/platform_icon/makaan_com.png",
  NO_BROKER: "/platform_icon/nobroker_in.png",
  SQUAREYARDS_COM: "/platform_icon/squareyards_com.png",
};

function getShortLabel(platform?: string | null) {
  if (!platform) return "-";
  switch (platform.toUpperCase()) {
    case "FB":
      return "FB";
    case "INSTA":
      return "IG";
    case "LINKEDIN":
      return "LI";
    case "TWITTER":
      return "TW";
    case "YOUTUBE":
      return "YT";
    case "WHATSAPP":
      return "WA";
    case "GOOGLE_ADS":
      return "GA";
    case "99_ACRES":
      return "99";
    case "MAGIC_BRICKS":
      return "MB";
    case "HOUSING_COM":
      return "HC";
    case "EXCEL":
      return "X";
    case "COMMON_FLOOR":
      return "CF";
    default:
      return (platform || "").slice(0, 2).toUpperCase();
  }
}

const PlatformAvatar: React.FC<PlatformAvatarProps> = ({
  platformCode,
  size = 36,
  variant = "circular",
  title,
  showLabel = false,
}) => {
  const code = (platformCode || "OTHERS").toString().toUpperCase();
  const icon = iconMap[code];

  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      title={(title ?? code)?.replaceAll("_", " ")}
    >
      <Avatar
        variant={variant}
        sx={{
          width: size,
          height: size,
          bgcolor: "#e0e0e0",
          fontSize: Math.round(size / 2.5),
          fontWeight: 700,
        }}
        src={icon}
      >
        {!icon && getShortLabel(code)}
      </Avatar>

      {showLabel && (
        <span style={{ fontSize: Math.round(size / 3.5), fontWeight: 600 }}>
          {getShortLabel(code)}
        </span>
      )}
    </div>
  );
};

export default PlatformAvatar;
