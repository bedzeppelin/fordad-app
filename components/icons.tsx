// SVG icon set ported 1:1 from Admin Panel.dc.html's makeIcon() so the app
// matches the approved design exactly.

type IconProps = { color?: string; size?: number };

function TodoIcon({ iconKey, color = "#2B4D8C", size = 18 }: { iconKey: string } & IconProps) {
  const s = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (iconKey) {
    case "pill":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
          <rect {...s} x={2} y={7} width={16} height={6} rx={3} />
          <line {...s} x1={10} y1={7} x2={10} y2={13} strokeWidth={1.4} />
        </svg>
      );
    case "water":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
          <path {...s} d="M10 2C10 2 4 8 4 12a6 6 0 0012 0C16 8 10 2 10 2Z" />
        </svg>
      );
    case "bowl":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
          <path {...s} d="M3 10C3 10 3 17 10 17C17 17 17 10 17 10" />
          <line {...s} x1={1} y1={10} x2={19} y2={10} />
        </svg>
      );
    case "walk":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
          <circle stroke={color} strokeWidth={1.8} fill="none" cx={13} cy={3.5} r={1.8} />
          <path {...s} d="M13 5.3L11.5 11L9 16.5" />
          <path {...s} d="M11.5 11L14 16.5" />
          <path {...s} d="M12.5 8.5L16.5 6.5" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
          <rect {...s} x={5} y={1} width={10} height={18} rx={2.5} />
          <line stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" x1={8} y1={4} x2={12} y2={4} />
          <circle fill={color} stroke="none" cx={10} cy={16.5} r={1} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
          <circle {...s} cx={10} cy={10} r={7} />
        </svg>
      );
  }
}

export const PillIcon = (p: IconProps) => <TodoIcon iconKey="pill" {...p} />;
export const WaterIcon = (p: IconProps) => <TodoIcon iconKey="water" {...p} />;
export const BowlIcon = (p: IconProps) => <TodoIcon iconKey="bowl" {...p} />;
export const WalkIcon = (p: IconProps) => <TodoIcon iconKey="walk" {...p} />;
export const PhoneIcon = (p: IconProps) => <TodoIcon iconKey="phone" {...p} />;
export { TodoIcon };

export function NavTodosIcon({ color }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={14} height={14} fill="none">
      <rect x={2} y={2} width={14} height={14} rx={2.5} stroke={color} strokeWidth={1.5} fill="none" />
      <path d="M5.5 9l2.5 2.5 4-5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function NavCalendarIcon({ color }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={14} height={14} fill="none">
      <rect x={1.5} y={3} width={15} height={13} rx={2.5} stroke={color} strokeWidth={1.5} fill="none" />
      <line x1={5} y1={1.5} x2={5} y2={5} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={13} y1={1.5} x2={13} y2={5} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={1.5} y1={7.5} x2={16.5} y2={7.5} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

export function NavNotesIcon({ color }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={14} height={14} fill="none">
      <rect x={5.5} y={1.5} width={7} height={9} rx={3.5} stroke={color} strokeWidth={1.5} fill="none" />
      <path d="M3 10.5a6 6 0 0012 0" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <line x1={9} y1={16} x2={9} y2={17.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={6.5} y1={17.5} x2={11.5} y2={17.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

export function NavLogsIcon({ color }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={14} height={14} fill="none">
      <circle cx={9} cy={9} r={7} stroke={color} strokeWidth={1.5} fill="none" />
      <path d="M9 5.5V9l2.5 1.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function NavSettingsIcon({ color }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={14} height={14} fill="none">
      <circle cx={9} cy={9} r={2.6} stroke={color} strokeWidth={1.5} fill="none" />
      <path
        d="M9 2.2v1.7M9 14.1v1.7M15.8 9h-1.7M3.9 9H2.2M13.6 4.4l-1.2 1.2M5.6 12.4l-1.2 1.2M13.6 13.6l-1.2-1.2M5.6 5.6L4.4 4.4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function LockIcon({ color = "#2B4D8C", size = 26 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <rect x={3.5} y={11} width={17} height={11.5} rx={3} stroke={color} strokeWidth={1.8} fill="none" />
      <path d="M8 11V7.5a4 4 0 018 0V11" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <circle cx={12} cy={16.5} r={1.5} fill={color} />
    </svg>
  );
}

export function SignOutIcon() {
  return (
    <svg viewBox="0 0 18 18" width={14} height={14} fill="none">
      <path d="M7 9h8m-3-3l3 3-3 3" stroke="#C84040" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M11 6V4a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1v-2" stroke="#C84040" strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PlusIcon({ color = "#FFFFFF", size = 11 }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} fill="none">
      <line x1={6} y1={1} x2={6} y2={11} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={1} y1={6} x2={11} y2={6} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  );
}

export function EditIcon({ color = "#6E6660" }: IconProps) {
  return (
    <svg viewBox="0 0 11 11" width={10} height={10} fill="none">
      <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5Z" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function TrashIcon({ color = "#C84040" }: IconProps) {
  return (
    <svg viewBox="0 0 11 11" width={10} height={10} fill="none">
      <path
        d="M1.5 3.2h8M3.8 3.2V2.3H7.2v.9M4.2 5v3.5M6.8 5v3.5M2.3 3.2l.5 6.5h5.4l.5-6.5"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ChevronUpIcon({ color = "#8A837C" }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={9} height={9} fill="none">
      <path d="M5 8.5V1.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <path d="M2.5 4L5 1.5 7.5 4" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function ChevronDownIcon({ color = "#8A837C" }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" width={9} height={9} fill="none">
      <path d="M5 1.5v7" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <path d="M2.5 6L5 8.5 7.5 6" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function CloseIcon({ color = "#6E6660", size = 10 }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} fill="none">
      <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function MicIcon({ color = "#A84848", size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 22 22" width={size} height={size} fill="none">
      <rect x={7} y={1.5} width={8} height={11} rx={4} stroke={color} strokeWidth={1.6} fill="none" />
      <path d="M3.5 12a7.5 7.5 0 0015 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <line x1={11} y1={19} x2={11} y2={21} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <line x1={7.5} y1={21} x2={14.5} y2={21} stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function MicSmallIcon({ color = "#A84848" }: IconProps) {
  return (
    <svg viewBox="0 0 14 14" width={12} height={12} fill="none">
      <rect x={4.5} y={1} width={5} height={7} rx={2.5} stroke={color} strokeWidth={1.3} fill="none" />
      <path d="M2 7a5 5 0 0010 0" stroke={color} strokeWidth={1.3} strokeLinecap="round" fill="none" />
      <line x1={7} y1={12} x2={7} y2={13.5} stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  );
}

export function CalTypeIcon({ type, color }: { type: string } & IconProps) {
  if (type === "procedure") {
    return (
      <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
        <path d="M8 3v10M3 8h10" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="none">
      <rect x={1.5} y={2.5} width={13} height={11} rx={2} stroke={color} strokeWidth={1.6} fill="none" />
    </svg>
  );
}
