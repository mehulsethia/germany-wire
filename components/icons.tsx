const base = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
type P = { size?: number; filled?: boolean };
const sz = (size?: number) => (size ? { width: size, height: size } : {});

export const IconCopy = ({ size }: P) => <svg {...base} {...sz(size)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>;
export const IconCheck = ({ size }: P) => <svg {...base} {...sz(size)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
export const IconBookmark = ({ size, filled }: P) => <svg {...base} {...sz(size)} fill={filled ? "currentColor" : "none"}><path d="M6 4h12v17l-6-4-6 4z" /></svg>;
export const IconExternal = ({ size }: P) => <svg {...base} {...sz(size)}><path d="M7 17 17 7M8 7h9v9" /></svg>;
export const IconCalendar = ({ size }: P) => <svg {...base} {...sz(size)}><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>;
export const IconSearch = ({ size }: P) => <svg {...base} {...sz(size)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const IconGrid = ({ size }: P) => <svg {...base} {...sz(size)}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>;
export const IconTable = ({ size }: P) => <svg {...base} {...sz(size)}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M3.5 10h17M3.5 15h17M9.5 10v9.5" /></svg>;
export const IconRefresh = ({ size }: P) => <svg {...base} {...sz(size)}><path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4" /></svg>;
export const IconX = ({ size }: P) => <svg {...base} {...sz(size)}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconArrow = ({ dir }: { dir: "asc" | "desc" }) => <svg {...base} width={12} height={12}>{dir === "asc" ? <path d="M12 19V5M6 11l6-6 6 6" /> : <path d="M12 5v14M6 13l6 6 6-6" />}</svg>;
export const IconThumb = ({ size, down, filled }: P & { down?: boolean }) => (
  <svg {...base} {...sz(size)} fill={filled ? "currentColor" : "none"} style={down ? { transform: "rotate(180deg)" } : undefined}>
    <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zM7 11l4-7a2 2 0 0 1 2 2v3h5.5a2 2 0 0 1 2 2.3l-1 6A2 2 0 0 1 17.5 20H7" />
  </svg>
);
