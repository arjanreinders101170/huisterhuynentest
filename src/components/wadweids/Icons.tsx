/* Iconenset — dunne lijnen, één stijl, altijd currentColor.
   Bewust klein gehouden: het merk leunt op typografie en beeld, niet op iconen. */
type P = { size?: number; className?: string };
const base = (size: number) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

export const IconSearch = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.6-3.6" /></svg>
);
export const IconUser = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="8" r="3.6" /><path d="M5 20c.7-3.6 3.6-5.6 7-5.6s6.3 2 7 5.6" /></svg>
);
export const IconGuests = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="9" cy="8.5" r="3.2" /><path d="M3 19c.6-3.1 3-4.8 6-4.8s5.4 1.7 6 4.8" /><path d="M16 6.2a3.2 3.2 0 0 1 0 6.1M18 14.6c2.1.6 3.4 2.2 3.8 4.4" /></svg>
);
export const IconBed = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 18v-8m0 4h18v4M3 12V8a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v4M21 14v-2a2 2 0 0 0-2-2h-7" /></svg>
);
export const IconBath = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 12h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2ZM6 12V6.5A2.5 2.5 0 0 1 8.5 4c1 0 1.8.6 2.2 1.4M6 18l-1 2M18 18l1 2" /></svg>
);
export const IconArea = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M8 3.5v3M3.5 8h3M16 20.5v-3M20.5 16h-3" /></svg>
);
export const IconPin = ({ size = 14, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 21s6.5-6.1 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 14.9 12 21 12 21Z" /><circle cx="12" cy="10.5" r="2.3" /></svg>
);
export const IconHeart = ({ size = 17, className, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.8a4.1 4.1 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z" />
  </svg>
);
export const IconArrow = ({ size = 15, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 12h15m-5.5-5.5L19 12l-5.5 5.5" /></svg>
);
export const IconCheck = ({ size = 15, className }: P) => (
  <svg {...base(size)} className={className}><path d="m4.5 12.5 4.5 4.5L19.5 6.5" /></svg>
);
export const IconChevron = ({ size = 14, className }: P) => (
  <svg {...base(size)} className={className}><path d="m6 9.5 6 6 6-6" /></svg>
);
export const IconCalendar = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3.5V7M16 3.5V7" /></svg>
);
export const IconSliders = ({ size = 17, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2.2" /><circle cx="10" cy="17" r="2.2" /></svg>
);
export const IconMenu = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 8h16M4 16h16" /></svg>
);
export const IconClose = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>
);

/* Kernwaarden — vier tekens die het merk vertellen zonder illustratie. */
export const IconSpace = ({ size = 30, className }: P) => (
  <svg {...base(size)} className={className}><path d="M2 15h20M2 19h20M6 11h12M9 7h6" /></svg>
);
export const IconNature = ({ size = 30, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 21V9M12 9c0-3 2-5 5-5 0 3-2 5-5 5ZM12 12c0-3-2-5-5-5 0 3 2 5 5 5ZM4 21h16" /></svg>
);
export const IconComfort = ({ size = 30, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 18v-6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6M4 15h16M7 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M6 18v2M18 18v2" /></svg>
);
export const IconPersonal = ({ size = 30, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 20.5s-7-4.2-7-9.2A3.9 3.9 0 0 1 12 8.6a3.9 3.9 0 0 1 7 2.7c0 5-7 9.2-7 9.2ZM12 3v2.5" /></svg>
);
export const IconTide = ({ size = 30, className }: P) => (
  <svg {...base(size)} className={className}><path d="M2 9c2.5-2 5-2 7.5 0S15 11 17.5 9 22 7 22 7M2 15c2.5-2 5-2 7.5 0s5 2 7.5 0 4.5-2 4.5-2" /></svg>
);
