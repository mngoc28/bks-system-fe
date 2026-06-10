/**
 * Premium admin UI tokens — navy primary + soft surfaces.
 * Dùng chung cho layout, PageBar, bảng, nút và chip ngữ cảnh.
 */
export const adminTheme = {
  page: "flex w-full flex-col gap-5",
  pagePadding: "",

  surface: "rounded-xl border border-primary/10 bg-white shadow-sm",
  surfaceMuted: "rounded-xl border border-primary/10 bg-white/80 backdrop-blur-sm",

  tableWrap: "w-full overflow-auto rounded-xl border border-primary/10 bg-white shadow-sm",
  tableHeader: "sticky top-0 z-10 bg-slate-100",

  btnPrimary:
    "bg-primary font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary-hover hover:shadow-primary/25",
  btnOutline:
    "border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-primary",

  chipBar: "flex flex-wrap items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3",
  chipBadge: "border-primary/20 bg-white text-slate-700",
  chipClearBtn: "h-7 px-2 text-xs font-semibold text-primary",

  textAccent: "text-primary",
  textMuted: "text-slate-500",
  highlightRing: "ring-2 ring-primary shadow-xl shadow-primary/20",

  /** Loading trong vùng nội dung (không phủ sidebar) */
  contentLoading:
    "flex min-h-[240px] w-full items-center justify-center rounded-xl border border-primary/10 bg-white/60",

  /** Admin sidebar — premium navy */
  sidebar: {
    root: "admin-sidebar flex h-full flex-col border-r border-white/10 transition-[width] duration-200 ease-in-out",
    logoBox:
      "flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-lg backdrop-blur-sm",
    brandTitle: "whitespace-nowrap font-extrabold tracking-tight text-white transition-all duration-200",
    toggleBtn:
      "rounded-full bg-white/10 p-1.5 text-white/80 shadow-sm transition hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    sectionTitle:
      "mt-4 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white/50 transition-opacity duration-200",
    divider: "mx-2 my-4 h-px bg-white/10",
    navItem:
      "relative flex items-center gap-2 rounded-lg text-[15px] text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white",
    navItemCompact: "relative flex items-center justify-center rounded-lg px-3 py-3 transition-all duration-200",
    navItemActive:
      "bg-white/20 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/25",
    navItemIcon:
      "flex size-5 shrink-0 items-center justify-center transition-all duration-200 [&_svg]:size-5",
    navChevron: "flex size-5 shrink-0 items-center justify-center text-white/60",
    navItemIconActive: "scale-110 text-white drop-shadow-sm",
    activeIndicator:
      "absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-full bg-premium-blue shadow-[0_0_10px_hsl(var(--premium-blue)/0.75)]",
    submenuItem:
      "relative flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white",
    submenuItemActive:
      "bg-white/18 font-semibold text-white ring-1 ring-inset ring-white/15",
  },
} as const;
