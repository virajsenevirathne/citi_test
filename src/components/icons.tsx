// One consistent line-icon set (24px grid, 1.75 stroke, currentColor). Inline SVG,
// so there is no icon-font/network cost and it works offline.
import type { ReactNode, SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number };

function Icon({ size = 20, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></Icon>
);
export const CardsIcon = (p: IconProps) => (
  <Icon {...p}><rect x="3" y="6" width="14" height="14" rx="2" /><path d="M7 6V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></Icon>
);
export const TargetIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></Icon>
);
export const TimerIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2" /><path d="M9 2h6" /></Icon>
);
export const FlagIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></Icon>
);
export const MoonIcon = (p: IconProps) => (
  <Icon {...p}><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" /></Icon>
);
export const SunIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>
);
export const CheckIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icon>
);
export const XIcon = (p: IconProps) => (
  <Icon {...p}><path d="M6 6l12 12M18 6L6 18" /></Icon>
);
export const ShuffleIcon = (p: IconProps) => (
  <Icon {...p}><path d="M16 3h5v5" /><path d="M4 20L21 3" /><path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" /></Icon>
);
export const StarIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" /></Icon>
);
export const CompassIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" /></Icon>
);
export const PartyIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 20l4.5-12 7.5 7.5L4 20z" /><path d="M14 4v2M19 9h2M17 6l1.5-1.5M10 4l.5 1" /></Icon>
);
