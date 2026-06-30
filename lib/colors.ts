// Design tokens lifted directly from Admin Panel.dc.html so the implementation
// matches the approved visual design pixel-for-pixel.
export const COLORS = {
  bg: "#F4F1EC",
  card: "#FFFFFF",
  inputBg: "#FAF8F5",
  border: "rgba(28,24,20,0.11)",
  borderSoft: "rgba(28,24,20,0.07)",

  ink: "#1C1814",
  inkMuted: "#6E6660",
  inkFaint: "#AFA89F",
  inkFainter: "#C2BBB2",

  blue: "#2B4D8C",
  blueDark: "#1E3264",
  blueBg: "rgba(43,77,140,0.09)",
  blueBgStrong: "rgba(43,77,140,0.12)",
  blueGradient: "linear-gradient(152deg,#2B4D8C 0%,#1E3264 100%)",

  red: "#C84040",
  redBg: "rgba(200,64,64,0.07)",
  redBgStrong: "rgba(200,64,64,0.08)",

  orange: "#B56A30",
  orangeBg: "rgba(181,106,48,0.10)",

  green: "#2E8050",
  greenBg: "rgba(46,128,80,0.10)",

  purple: "#6B3F9E",
  pink: "#B5407A",

  neutralBg: "rgba(28,24,20,0.05)",
  neutralBgStrong: "rgba(28,24,20,0.07)",
} as const;

export const CAL_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  appointment: { label: "Appt", color: COLORS.blue, bg: COLORS.blueBg },
  procedure: { label: "Procedure", color: COLORS.orange, bg: COLORS.orangeBg },
  therapy: { label: "Therapy", color: COLORS.green, bg: COLORS.greenBg },
  other: { label: "Other", color: COLORS.inkMuted, bg: COLORS.neutralBgStrong },
};

export const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const ICON_KEYS = ["pill", "water", "bowl", "walk", "phone"] as const;
export type IconKey = (typeof ICON_KEYS)[number];

export const ICON_COLOR_MAP: Record<string, { bg: string; accent: string }> = {
  pill: { bg: "#EDF1FB", accent: "#2B4D8C" },
  water: { bg: "#EEF5FB", accent: "#3A7BC8" },
  bowl: { bg: "#FBF2EC", accent: "#B56A30" },
  walk: { bg: "#EDF6F1", accent: "#2E8050" },
  phone: { bg: "#FBEFF5", accent: "#B5407A" },
};

export function getIconColors(iconKey: string): { bg: string; accent: string } {
  return ICON_COLOR_MAP[iconKey] ?? { bg: COLORS.neutralBg, accent: COLORS.inkMuted };
}
