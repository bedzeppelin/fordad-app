// Icon set ported 1:1 from Daily Companion.dc.html's makeIcon/makeCalIcon/makeNavIcon.

export function TaskIcon({ iconKey, color = "#2B4D8C", size = 28 }: { iconKey: string; color?: string; size?: number }) {
  const s = { fill: "none", stroke: color, strokeWidth: 2.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (iconKey) {
    case "pill":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <rect {...s} x={2} y={8} width={20} height={8} rx={4} />
          <line {...s} x1={12} y1={8} x2={12} y2={16} strokeWidth={1.8} />
        </svg>
      );
    case "water":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path {...s} d="M12 2C12 2 5 9 5 14a7 7 0 0014 0C19 9 12 2 12 2Z" />
        </svg>
      );
    case "bowl":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path {...s} d="M3 12C3 12 3 20 12 20C21 20 21 12 21 12" />
          <line {...s} x1={1} y1={12} x2={23} y2={12} />
          <path stroke={color} strokeWidth={1.9} strokeLinecap="round" fill="none" d="M8 9C8 7 9.2 6 8.5 4" />
          <path stroke={color} strokeWidth={1.9} strokeLinecap="round" fill="none" d="M12 8C12 6 13.2 5 12.5 3" />
          <path stroke={color} strokeWidth={1.9} strokeLinecap="round" fill="none" d="M16 9C16 7 17.2 6 16.5 4" />
        </svg>
      );
    case "walk":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <circle stroke={color} strokeWidth={2.1} fill="none" cx={15.5} cy={4} r={2.2} />
          <path {...s} d="M15.5 6.2L13.5 13L10.5 19.5" />
          <path {...s} d="M13.5 13L16.5 19.5" />
          <path {...s} d="M14.5 10L19 7.5" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <rect {...s} x={5} y={2} width={14} height={20} rx={3} />
          <line stroke={color} strokeWidth={1.7} strokeLinecap="round" fill="none" x1={9} y1={5.5} x2={15} y2={5.5} />
          <circle fill={color} stroke="none" cx={12} cy={18.5} r={1.2} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <circle {...s} cx={12} cy={12} r={8} />
        </svg>
      );
  }
}

export function CalIcon({ iconKey, color }: { iconKey: string; color: string }) {
  const s = { fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (iconKey) {
    case "pill":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <rect {...s} x={2} y={8} width={20} height={8} rx={4} />
          <line {...s} x1={12} y1={8} x2={12} y2={16} strokeWidth={1.6} />
        </svg>
      );
    case "water":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <path {...s} d="M12 2C12 2 5 9 5 14a7 7 0 0014 0C19 9 12 2 12 2Z" />
        </svg>
      );
    case "bowl":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <path {...s} d="M3 12C3 12 3 20 12 20C21 20 21 12 21 12" />
          <line {...s} x1={1} y1={12} x2={23} y2={12} />
        </svg>
      );
    case "walk":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <circle stroke={color} strokeWidth={2} fill="none" cx={15.5} cy={4} r={2} />
          <path {...s} d="M15.5 6.2L13.5 13L10.5 19.5" />
          <path {...s} d="M13.5 13L16.5 19.5" />
          <path {...s} d="M14.5 10L19 7.5" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <rect {...s} x={5} y={2} width={14} height={20} rx={3} />
          <line stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" x1={9} y1={5.5} x2={15} y2={5.5} />
          <circle fill={color} stroke="none" cx={12} cy={18.5} r={1.1} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none">
          <circle {...s} cx={12} cy={12} r={8} />
        </svg>
      );
  }
}

export function NavIcon({ tabKey, color }: { tabKey: string; color: string }) {
  const s = { stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  switch (tabKey) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" width={22} height={22} fill="none">
          <path {...s} d="M3 10.5L12 3l9 7.5" />
          <path {...s} d="M5 10.5V21h5v-6h4v6h5V10.5" />
        </svg>
      );
    case "todos":
      return (
        <svg viewBox="0 0 24 24" width={22} height={22} fill="none">
          <path {...s} d="M5 7l1.5 1.5L9 6" />
          <path {...s} d="M5 12l1.5 1.5L9 11" />
          <path {...s} d="M5 17l1.5 1.5L9 16" />
          <line {...s} x1={12} y1={7} x2={19} y2={7} />
          <line {...s} x1={12} y1={12} x2={19} y2={12} />
          <line {...s} x1={12} y1={17} x2={19} y2={17} />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" width={22} height={22} fill="none">
          <rect {...s} x={2} y={3.5} width={20} height={17} rx={2.5} />
          <line {...s} x1={8} y1={2} x2={8} y2={5.5} />
          <line {...s} x1={16} y1={2} x2={16} y2={5.5} />
          <line {...s} x1={2} y1={9} x2={22} y2={9} />
        </svg>
      );
    case "reports":
      return (
        <svg viewBox="0 0 24 24" width={22} height={22} fill="none">
          <line {...s} x1={3} y1={21} x2={21} y2={21} />
          <line stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" x1={6} y1={21} x2={6} y2={15} />
          <line stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" x1={10.5} y1={21} x2={10.5} y2={9} />
          <line stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" x1={15} y1={21} x2={15} y2={12} />
          <line stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" x1={19.5} y1={21} x2={19.5} y2={5} />
        </svg>
      );
    case "notes":
      return (
        <svg viewBox="0 0 24 24" width={22} height={22} fill="none">
          <rect {...s} x={8.5} y={2} width={7} height={11} rx={3.5} />
          <path {...s} d="M5 11a7 7 0 0014 0" />
          <line {...s} x1={12} y1={18} x2={12} y2={22} />
        </svg>
      );
    default:
      return <svg viewBox="0 0 24 24" width={22} height={22} fill="none" />;
  }
}

export function AppointmentIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 20 20" width={22} height={22} fill="none">
      <rect x={1} y={3} width={18} height={15} rx={3} stroke={color} strokeWidth={1.6} fill="none" />
      <line x1={6} y1={1} x2={6} y2={5} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <line x1={14} y1={1} x2={14} y2={5} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <line x1={1} y1={8} x2={19} y2={8} stroke={color} strokeWidth={1.3} />
    </svg>
  );
}

export function MicIconLarge() {
  return (
    <svg viewBox="0 0 24 24" width={34} height={34}>
      <rect x={8} y={2} width={8} height={13} rx={4} stroke="white" strokeWidth={2} fill="none" />
      <path d="M4 12a8 8 0 0016 0" stroke="white" strokeWidth={2} strokeLinecap="round" fill="none" />
      <line x1={12} y1={20} x2={12} y2={22.5} stroke="white" strokeWidth={2} strokeLinecap="round" />
      <line x1={9} y1={22.5} x2={15} y2={22.5} stroke="white" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function CheckBigIcon() {
  return (
    <svg viewBox="0 0 28 28" width={32} height={32}>
      <path d="M5 14l6.5 6.5 11-12" stroke="#2E8050" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function DoneCheckIcon() {
  return (
    <svg viewBox="0 0 22 22" width={21} height={21}>
      <circle cx={11} cy={11} r={11} fill="rgba(255,255,255,0.18)" />
      <path d="M7 11l3 3 5-6" stroke="white" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function ClockHintIcon() {
  return (
    <svg viewBox="0 0 14 14" width={12} height={12}>
      <circle cx={7} cy={7} r={5.5} stroke="#C8C1B8" strokeWidth={1.4} fill="none" />
      <path d="M7 4.5v2.5l1.5 1" stroke="#C8C1B8" strokeWidth={1.4} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function ChevronRightSmall() {
  return (
    <svg viewBox="0 0 8 14" width={7} height={12} fill="none">
      <path d="M1 1l6 6-6 6" stroke="#C2BBB2" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseSmallIcon({ color = "#AFA89F" }: { color?: string }) {
  return (
    <svg viewBox="0 0 20 20" width={16} height={16}>
      <path d="M4 4l12 12M16 4L4 16" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function XSmallIcon({ color = "#C2BBB2" }: { color?: string }) {
  return (
    <svg viewBox="0 0 12 12" width={11} height={11}>
      <path d="M2 2l8 8M10 2l-8 8" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function MinusIcon({ color = "#6E6660" }: { color?: string }) {
  return (
    <svg viewBox="0 0 14 14" width={14} height={14} fill="none">
      <line x1={3} y1={7} x2={11} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function PlusBigIcon({ color = "white" }: { color?: string }) {
  return (
    <svg viewBox="0 0 14 14" width={14} height={14} fill="none">
      <line x1={7} y1={3} x2={7} y2={11} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={3} y1={7} x2={11} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function WaterCupSvg({ filled }: { filled: boolean }) {
  const stroke = filled ? "#3A7BC8" : "#C0CEDF";
  const fill = filled ? "rgba(58,123,200,0.13)" : "transparent";
  return (
    <svg viewBox="0 0 22 28" width={28} height={36} fill="none">
      <path d="M2 3 H20 L17.5 25 H4.5 Z" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" fill={fill} />
    </svg>
  );
}
