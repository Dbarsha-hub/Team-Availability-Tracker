import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  TrendingUp,
  Search,
  Bell,
  Calendar,
  Mail,
  Briefcase,
  Building2,
  X,
  MoreHorizontal,
  Zap,
  Activity,
  UserCheck,
  UserX,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  getMembers,
  updateMemberAvailability,
} from "../api/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  available: boolean;
  avatar: string;
  initials: string;
  accentGrad: string;
  ringColor: string;
}

interface Toast {
  id: number;
  message: string;
  sub: string;
  type: "available" | "unavailable";
}

type Filter = "all" | "available" | "unavailable";

// ─── Department Config ────────────────────────────────────────────────────────

const DEPT_CONFIG: Record<string, { badge: string; text: string; dot: string }> = {
  Engineering:  { badge: "bg-blue-50 border border-blue-100",     text: "text-blue-600",   dot: "bg-blue-500" },
  Design:       { badge: "bg-violet-50 border border-violet-100", text: "text-violet-600", dot: "bg-violet-500" },
  Marketing:    { badge: "bg-orange-50 border border-orange-100", text: "text-orange-600", dot: "bg-orange-500" },
  Product:      { badge: "bg-pink-50 border border-pink-100",     text: "text-pink-600",   dot: "bg-pink-500" },
  Analytics:    { badge: "bg-cyan-50 border border-cyan-100",     text: "text-cyan-600",   dot: "bg-cyan-500" },
  Infrastructure:{ badge: "bg-slate-50 border border-slate-200",  text: "text-slate-600",  dot: "bg-slate-500" },
};
const deptCfg = (d: string) => DEPT_CONFIG[d] ?? DEPT_CONFIG.Engineering;

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const gradients = [
  "from-violet-400 to-purple-600",
  "from-blue-400 to-indigo-600",
  "from-cyan-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-orange-400 to-red-600",
];

const ringColors = [
  "#7C3AED",
  "#3B82F6",
  "#06B6D4",
  "#10B981",
  "#F97316",
];
const INITIAL_MEMBERS: Member[] = [
  { id: 1,  name: "Sarah Mitchell",   role: "Product Designer",    department: "Design",         email: "sarah.mitchell@acme.co",     available: true,  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&auto=format", initials: "SM", accentGrad: "from-violet-400 to-purple-600",  ringColor: "#7C3AED" },
  { id: 2,  name: "James Okafor",     role: "Senior Engineer",     department: "Engineering",    email: "james.okafor@acme.co",       available: true,  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&auto=format", initials: "JO", accentGrad: "from-blue-400 to-indigo-600",    ringColor: "#3B82F6" },
  { id: 3,  name: "Priya Nair",       role: "Engineering Manager", department: "Engineering",    email: "priya.nair@acme.co",         available: false, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&auto=format", initials: "PN", accentGrad: "from-cyan-400 to-blue-600",      ringColor: "#06B6D4" },
  { id: 4,  name: "Marcus Webb",      role: "Data Scientist",      department: "Analytics",      email: "marcus.webb@acme.co",        available: true,  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&auto=format", initials: "MW", accentGrad: "from-emerald-400 to-teal-600",   ringColor: "#10B981" },
  { id: 5,  name: "Elena Vasquez",    role: "UX Researcher",       department: "Design",         email: "elena.vasquez@acme.co",      available: false, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop&auto=format", initials: "EV", accentGrad: "from-rose-400 to-pink-600",      ringColor: "#F43F5E" },
  { id: 6,  name: "Tom Harrington",   role: "DevOps Engineer",     department: "Infrastructure", email: "tom.harrington@acme.co",     available: true,  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&auto=format", initials: "TH", accentGrad: "from-amber-400 to-orange-600",   ringColor: "#F59E0B" },
  { id: 7,  name: "Aisha Kamara",     role: "Marketing Lead",      department: "Marketing",      email: "aisha.kamara@acme.co",       available: true,  avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&h=96&fit=crop&auto=format", initials: "AK", accentGrad: "from-violet-400 to-indigo-600",  ringColor: "#7C3AED" },
  { id: 8,  name: "Daniel Cho",       role: "Frontend Developer",  department: "Engineering",    email: "daniel.cho@acme.co",         available: false, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=96&h=96&fit=crop&auto=format", initials: "DC", accentGrad: "from-blue-400 to-violet-600",    ringColor: "#5B5FEF" },
  { id: 9,  name: "Fatima Al-Rashid", role: "Product Manager",     department: "Product",        email: "fatima.al-rashid@acme.co",   available: true,  avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=96&h=96&fit=crop&auto=format", initials: "FA", accentGrad: "from-pink-400 to-rose-600",      ringColor: "#EC4899" },
  { id: 10, name: "Ryan Kowalski",    role: "Backend Engineer",    department: "Engineering",    email: "ryan.kowalski@acme.co",      available: false, avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=96&h=96&fit=crop&auto=format", initials: "RK", accentGrad: "from-sky-400 to-blue-600",       ringColor: "#0EA5E9" },
  { id: 11, name: "Chloe Bergmann",   role: "Content Strategist",  department: "Marketing",      email: "chloe.bergmann@acme.co",     available: true,  avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=96&h=96&fit=crop&auto=format", initials: "CB", accentGrad: "from-orange-400 to-amber-600",   ringColor: "#F97316" },
  { id: 12, name: "Luca Ferretti",    role: "Security Engineer",   department: "Infrastructure", email: "luca.ferretti@acme.co",      available: true,  avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop&auto=format", initials: "LF", accentGrad: "from-slate-400 to-gray-600",     ringColor: "#64748B" },
];

function transformMember(user: any, index: number): Member {
  return {
    ...user,

    avatar:
      user.image ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`,

    initials: user.name
      .split(" ")
      .map((n: string) => n[0])
      .join(""),

    accentGrad: gradients[index % gradients.length],

    ringColor: ringColors[index % ringColors.length],
  };
}

// ─── Tiny sparkline ───────────────────────────────────────────────────────────

function Sparkline({ color, up }: { color: string; up: boolean }) {
  const pts = up
    ? [[0,22],[4,18],[8,20],[12,14],[16,16],[20,10],[24,12],[28,6],[32,8],[36,3]]
    : [[0,4],[4,8],[8,6],[12,12],[16,10],[20,16],[24,14],[28,20],[32,18],[36,22]];
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  return (
    <svg width="40" height="26" viewBox="0 0 36 26" fill="none" className="opacity-80">
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L36,26 L0,26 Z`} fill={`url(#sg-${color})`} />
      <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── Animated count ───────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    const start = prev.current;
    const diff = value - start;
    const dur = 400;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * eased));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = value;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{display}</span>;
}

// ─── StatsCard ────────────────────────────────────────────────────────────────

function StatsCard({
  icon,
  value,
  label,
  gradFrom,
  gradTo,
  sparkColor,
  trend,
  trendUp,
  loaded,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  gradFrom: string;
  gradTo: string;
  sparkColor: string;
  trend: string;
  trendUp: boolean;
  loaded: boolean;
}) {
  if (!loaded) {
    return (
      <div className="relative bg-white rounded-3xl border border-[#ECEEF5] p-6 overflow-hidden shimmer">
        <div className="flex justify-between items-start mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gray-100" />
          <div className="w-16 h-5 bg-gray-100 rounded-full" />
        </div>
        <div className="h-8 w-20 bg-gray-100 rounded-lg mb-2" />
        <div className="h-4 w-28 bg-gray-100 rounded" />
      </div>
    );
  }

  const numVal = typeof value === "number" ? value : parseInt(value as string);

  return (
    <div
      className="group relative bg-white rounded-3xl border border-[#ECEEF5] p-6 overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: "0 8px 24px rgba(30,41,59,.06)",
        ["--hover-shadow" as string]: "0 20px 60px rgba(91,95,239,.15)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(91,95,239,.15)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(91,95,239,.25)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(30,41,59,.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "#ECEEF5";
      }}
    >
      {/* Gradient glow bg */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-[0.06] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.12]"
        style={{ background: `radial-gradient(circle, ${gradFrom}, ${gradTo})` }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
          >
            {icon}
          </div>
          {/* Trend */}
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
            }`}
          >
            {trendUp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {trend}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-[#0F1117] tracking-tight leading-none mb-1.5">
              {typeof value === "string" ? value : <AnimatedNumber value={numVal} />}
            </p>
            <p className="text-sm text-[#8B92A9] font-medium">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({
  search,
  onSearch,
  currentUser,
}: {
  search: string;
  onSearch: (v: string) => void;
  currentUser: {
    name: string;
    role: string;
  };
}) {
  return (
    <div className="sticky top-0 z-40 flex justify-center px-4 pt-4 pb-2">
      <nav
        className="w-full max-w-7xl flex items-center gap-3 px-5 h-[76px] rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(236,238,245,0.9)",
          boxShadow: "0 8px 32px rgba(91,95,239,.08), 0 1px 0 rgba(255,255,255,.8) inset",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg, #5B5FEF, #7C3AED)" }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-[#0F1117] leading-none">Team Availability</p>
            <p className="text-[11px] text-[#8B92A9] leading-none mt-0.5">Workspace dashboard</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm mx-auto">
          <div
            className="relative flex items-center rounded-xl overflow-hidden"
            style={{
              background: "rgba(246,247,251,0.9)",
              border: "1px solid #ECEEF5",
            }}
          >
            <Search className="absolute left-3 w-4 h-4 text-[#8B92A9]" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-transparent text-[#0F1117] placeholder-[#B0B6C8] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {/* Bell */}
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-[#F4F5FA]"
          >
            <Bell className="w-4.5 h-4.5 text-[#8B92A9]" style={{ width: 18, height: 18 }} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
              style={{ background: "linear-gradient(135deg,#F43F5E,#FB7185)" }}
            />
          </button>

          {/* Avatar pill */}
          <div
            className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-2xl cursor-pointer transition-all hover:shadow-sm"
            style={{
              background: "rgba(246,247,251,0.9)",
              border: "1px solid #ECEEF5",
            }}
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
              style={{ background: "linear-gradient(135deg,#5B5FEF,#7C3AED)" }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-[#0F1117] leading-none">
                {currentUser.name}
              </p>

              <p className="text-[10px] text-[#8B92A9] leading-none mt-0.5">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

// ─── Segmented Filter ─────────────────────────────────────────────────────────

function FilterButtons({
  active,
  onChange,
  counts,
}: {
  active: Filter;
  onChange: (f: Filter) => void;
  counts: { all: number; available: number; unavailable: number };
}) {
  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all",         label: "All",         count: counts.all },
    { key: "available",   label: "Available",   count: counts.available },
    { key: "unavailable", label: "Unavailable", count: counts.unavailable },
  ];

  return (
    <div
      className="inline-flex items-center p-1 rounded-2xl gap-1"
      style={{
        background: "rgba(255,255,255,0.8)",
        border: "1px solid #ECEEF5",
        backdropFilter: "blur(12px)",
        boxShadow: "0 2px 12px rgba(30,41,59,.06)",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
          style={
            active === t.key
              ? {
                  background: "linear-gradient(135deg, #5B5FEF, #7C3AED)",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(91,95,239,.35)",
                }
              : { color: "#8B92A9" }
          }
        >
          {t.label}
          <span
            className="text-xs px-1.5 py-0.5 rounded-lg font-bold"
            style={
              active === t.key
                ? { background: "rgba(255,255,255,.2)", color: "#fff" }
                : { background: "#F4F5FA", color: "#8B92A9" }
            }
          >
            {t.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Premium Toggle ───────────────────────────────────────────────────────────

function AvailabilityToggle({ available, onChange }: { available: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={available}
      onClick={onChange}
      className="relative w-[52px] h-7 rounded-full transition-all duration-300 focus:outline-none"
      style={{
        background: available
          ? "linear-gradient(135deg, #10B981, #059669)"
          : "#E2E5EF",
        boxShadow: available
          ? "0 0 0 3px rgba(16,185,129,.15), inset 0 1px 2px rgba(0,0,0,.08)"
          : "inset 0 1px 2px rgba(0,0,0,.08)",
      }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-[22px] h-[22px] bg-white rounded-full transition-transform duration-300"
        style={{
          transform: available ? "translateX(24px)" : "translateX(0)",
          boxShadow: "0 2px 8px rgba(0,0,0,.15)",
        }}
      />
    </button>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function TeamMemberCard({
  member,
  onToggle,
  loaded,
}: {
  member: Member;
  onToggle: (id: number) => void;
  loaded: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const dc = deptCfg(member.department);

  if (!loaded) {
    return (
      <div className="bg-white rounded-3xl border border-[#ECEEF5] overflow-hidden shimmer">
        <div className="h-1.5 w-full bg-gray-100" />
        <div className="p-5">
          <div className="flex flex-col items-center gap-3 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gray-100" />
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-3.5 w-20 bg-gray-100 rounded" />
            <div className="h-6 w-24 bg-gray-100 rounded-full" />
          </div>
          <div className="space-y-2.5">
            <div className="h-3.5 w-full bg-gray-100 rounded" />
            <div className="h-3.5 w-4/5 bg-gray-100 rounded" />
            <div className="h-3.5 w-3/4 bg-gray-100 rounded" />
          </div>
          <div className="mt-5 pt-4 border-t border-[#F4F5FA] flex justify-between items-center">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="w-12 h-6 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative bg-white rounded-3xl border overflow-hidden cursor-default transition-all duration-300"
      style={{
        borderColor: hovered ? "rgba(91,95,239,.25)" : "#ECEEF5",
        boxShadow: hovered
          ? "0 20px 60px rgba(91,95,239,.15)"
          : "0 8px 24px rgba(30,41,59,.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gradient accent strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${member.accentGrad}`} />

      <div className="p-5">
        {/* Top row: three-dot */}
        <div className="flex justify-end mb-1">
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#B0B6C8] hover:text-[#5B5FEF] hover:bg-[#EEF0FF] transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center text-center mb-4 -mt-3">
          <div className="relative mb-3">
            <div
              className="p-0.5 rounded-2xl"
              style={{
                background: hovered
                  ? `linear-gradient(135deg, ${member.ringColor}60, ${member.ringColor}20)`
                  : "transparent",
                transition: "background .3s",
              }}
            >
              {!imgError ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  onError={() => setImgError(true)}
                  className="w-16 h-16 rounded-[14px] object-cover"
                  style={{
                    boxShadow: `0 4px 16px ${member.ringColor}30`,
                  }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-[14px] flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${member.ringColor}, ${member.ringColor}99)`,
                    boxShadow: `0 4px 16px ${member.ringColor}30`,
                  }}
                >
                  {member.initials}
                </div>
              )}
            </div>

            {/* Online dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white"
              style={{
                background: member.available
                  ? "linear-gradient(135deg,#10B981,#059669)"
                  : "linear-gradient(135deg,#F43F5E,#FB7185)",
                boxShadow: member.available
                  ? "0 0 0 2px rgba(16,185,129,.2)"
                  : "0 0 0 2px rgba(244,63,94,.2)",
              }}
            />
          </div>

          <h3 className="font-bold text-[#0F1117] text-sm leading-snug">{member.name}</h3>
          <p className="text-xs text-[#8B92A9] mt-0.5 font-medium">{member.role}</p>

          {/* Availability chip */}
          <div
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={
              member.available
                ? {
                    background: "linear-gradient(135deg, rgba(16,185,129,.12), rgba(5,150,105,.06))",
                    color: "#059669",
                    border: "1px solid rgba(16,185,129,.2)",
                  }
                : {
                    background: "linear-gradient(135deg, rgba(244,63,94,.1), rgba(251,113,133,.06))",
                    color: "#E11D48",
                    border: "1px solid rgba(244,63,94,.2)",
                  }
            }
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: member.available
                  ? "linear-gradient(135deg,#10B981,#059669)"
                  : "linear-gradient(135deg,#F43F5E,#FB7185)",
              }}
            />
            {member.available ? "● Online" : "● Offline"}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 rounded-2xl p-3 mb-4" style={{ background: "#F9FAFB" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#5B5FEF,#7C3AED)" }}
            >
              <Building2 className="w-3 h-3 text-white" />
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dc.badge} ${dc.text}`}
            >
              {member.department}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#3B82F6,#06B6D4)" }}
            >
              <Mail className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-[#8B92A9] truncate font-medium">{member.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}
            >
              <Briefcase className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-[#8B92A9] truncate font-medium">{member.role}</span>
          </div>
        </div>

        {/* Toggle row */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid #F4F5FA" }}
        >
          <span className="text-xs font-semibold text-[#8B92A9]">Availability</span>
          <AvailabilityToggle available={member.available} onChange={() => onToggle(member.id)} />
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
        style={{
          background: "linear-gradient(135deg, rgba(91,95,239,.1), rgba(124,58,237,.06))",
          border: "1px solid rgba(91,95,239,.15)",
        }}
      >
        <Users className="w-9 h-9 text-[#5B5FEF] opacity-60" />
      </div>
      <h3 className="text-base font-bold text-[#0F1117] mb-1.5">No members found</h3>
      <p className="text-sm text-[#8B92A9] max-w-xs">
        {query
          ? `No results for "${query}". Try a different search.`
          : "No members in this category."}
      </p>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function ToastNotification({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3.5 min-w-[280px] animate-toast-in"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(236,238,245,.9)",
            boxShadow: "0 12px 40px rgba(30,41,59,.14)",
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background:
                toast.type === "available"
                  ? "linear-gradient(135deg,#10B981,#059669)"
                  : "linear-gradient(135deg,#F43F5E,#FB7185)",
            }}
          >
            {toast.type === "available" ? (
              <UserCheck className="w-4 h-4 text-white" />
            ) : (
              <UserX className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F1117]">{toast.message}</p>
            <p className="text-xs text-[#8B92A9] mt-0.5">{toast.sub}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#B0B6C8] hover:text-[#8B92A9] transition-colors ml-1 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const currentUser = {
    name: "Barsha",
    role: "Admin",
  };
  const [members, setMembers] =useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const users = await getMembers();

        setMembers(
          users.map((user: any, index: number) =>
            transformMember(user, index)
          )
        );

        setLoaded(true);
      } catch (err) {
        console.error(err);
      }
    }

    fetchMembers();
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const toggleMember = useCallback(
    async (id: number) => {

      const member = members.find((m) => m.id === id);

      if (!member) return;

      const newStatus = !member.available;

      try {

        await updateMemberAvailability(id, newStatus);

        setMembers((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, available: newStatus }
              : m
          )
        );

        const toastId = Date.now();

        setToasts((prev) => [
          ...prev,
          {
            id: toastId,
            message: `${member.name.split(" ")[0]} is now ${
              newStatus ? "Available" : "Unavailable"
            }`,
            sub: "Database updated successfully",
            type: newStatus ? "available" : "unavailable",
          },
        ]);

        setTimeout(() => dismissToast(toastId), 4000);

      } catch (err) {
        console.error(err);
      }

    },
    [members, dismissToast]
  );

  const filtered = members.filter((m) => {
    const ms = m.name.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "all" ? true : filter === "available" ? m.available : !m.available;
    return ms && mf;
  });

  const totalAvailable = members.filter((m) => m.available).length;
  const totalUnavailable = members.length - totalAvailable;
  const pct = Math.round((totalAvailable / members.length) * 100);

  const searchFiltered = (fn: (m: Member) => boolean) =>
    members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) && fn(m)).length;

  const counts = {
    all: searchFiltered(() => true),
    available: searchFiltered((m) => m.available),
    unavailable: searchFiltered((m) => !m.available),
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#F6F7FB" }}
    >
      {/* ── Global styles ── */}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-toast-in { animation: toast-in 0.3s cubic-bezier(.34,1.56,.64,1); }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.5s ease-out both; }

        @keyframes shimmer {
          0%   { background-position: -500px 0; }
          100% { background-position: 500px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #F4F5FA 25%, #ECEEF5 50%, #F4F5FA 75%);
          background-size: 1000px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        .shimmer > * { opacity: 0; }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #DDDFE9; border-radius: 99px; }
      `}</style>

      {/* ── Background ambient glows ── */}
      <div
        className="fixed top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 70% 20%, rgba(124,58,237,.07) 0%, transparent 60%)",
        }}
      />
      <div
        className="fixed bottom-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle at 30% 80%, rgba(59,130,246,.06) 0%, transparent 60%)",
        }}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(91,95,239,.04) 0%, transparent 70%)",
        }}
      />

      {/* ── Nav ── */}
      <Navbar
        search={search}
        onSearch={setSearch}
        currentUser={currentUser}
      />

      {/* ── Main ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-up">
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#5B5FEF,#7C3AED)" }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold text-[#5B5FEF] uppercase tracking-widest">
              Live Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F1117] leading-tight tracking-tight mb-2">
            Team Overview
          </h1>
          <p className="text-sm text-[#8B92A9] font-medium">
            Monitor and manage availability across your entire team in real time.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard loaded={loaded} icon={<Users className="w-5 h-5 text-white" />}     value={members.length}  label="Total Members"     gradFrom="#5B5FEF" gradTo="#7C3AED" sparkColor="#5B5FEF" trend="2 new" trendUp={true} />
          <StatsCard loaded={loaded} icon={<Activity className="w-5 h-5 text-white" />}  value={totalAvailable}  label="Available Now"     gradFrom="#10B981" gradTo="#059669" sparkColor="#10B981" trend="+3 today" trendUp={true} />
          <StatsCard loaded={loaded} icon={<UserX className="w-5 h-5 text-white" />}     value={totalUnavailable} label="Unavailable"      gradFrom="#F43F5E" gradTo="#FB923C" sparkColor="#F43F5E" trend="2 less" trendUp={false} />
          <StatsCard loaded={loaded} icon={<TrendingUp className="w-5 h-5 text-white" />} value={`${pct}%`}      label="Availability Rate" gradFrom="#F59E0B" gradTo="#EF4444" sparkColor="#F59E0B" trend="+5% wk" trendUp={true} />
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <FilterButtons active={filter} onChange={setFilter} counts={counts} />
          <div
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8B92A9]"
            style={{ background: "rgba(255,255,255,.8)", border: "1px solid #ECEEF5" }}
          >
            <Calendar className="w-3.5 h-3.5" />
            Showing{" "}
            <span className="text-[#0F1117] font-bold">{filtered.length}</span> of{" "}
            {members.length} members
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {!loaded
            ? Array.from({ length: 8 }).map((_, i) => (
                <TeamMemberCard key={i} member={INITIAL_MEMBERS[0]} onToggle={() => {}} loaded={false} />
              ))
            : filtered.length === 0
            ? <EmptyState query={search} />
            : filtered.map((m) => (
                <TeamMemberCard key={m.id} member={m} onToggle={toggleMember} loaded={loaded} />
              ))}
        </div>
      </main>

      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
