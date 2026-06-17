/**
 * Icon — thin wrapper over lucide-react that preserves the design's
 * `<Icon name="award" size={16} />` call style (kebab-case names).
 *
 * The original prototype loaded Lucide from a CDN and injected SVGs by hand to
 * dodge a React-reconciliation crash; with lucide-react as proper components
 * none of that is needed.
 */
import {
  Award, ClipboardList, Smile, TrendingUp, ArrowRight, ArrowLeft,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Check, X, LogOut,
  LoaderCircle, QrCode, Calendar, Clock, MapPin, HelpCircle, Info, Download,
  Image as ImageIcon, Share2, ShieldCheck, PartyPopper, Wrench, GraduationCap,
  Presentation, Sparkles, User, Shield, LayoutDashboard, Users, BarChart3,
  Settings, Menu, ExternalLink, Plus, Pencil, ListChecks, ListPlus, Star,
  CircleDot, CheckSquare, Square, Circle, Trash2, Search, SearchX, Eye,
  FileSpreadsheet, FileText, Mail, KeyRound, UserPlus, Inbox, RotateCcw,
  Sun, Moon,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

const MAP: Record<string, LucideIcon> = {
  award: Award, "clipboard-list": ClipboardList, smile: Smile, "trending-up": TrendingUp,
  "arrow-right": ArrowRight, "arrow-left": ArrowLeft, "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft, "chevron-up": ChevronUp, "chevron-down": ChevronDown,
  check: Check, x: X, "log-out": LogOut, "loader-circle": LoaderCircle, "qr-code": QrCode,
  calendar: Calendar, clock: Clock, "map-pin": MapPin, "help-circle": HelpCircle, info: Info,
  download: Download, image: ImageIcon, "share-2": Share2, "shield-check": ShieldCheck,
  "party-popper": PartyPopper, wrench: Wrench, "graduation-cap": GraduationCap,
  presentation: Presentation, sparkles: Sparkles, user: User, shield: Shield,
  "layout-dashboard": LayoutDashboard, users: Users, "bar-chart-3": BarChart3,
  settings: Settings, menu: Menu, "external-link": ExternalLink, plus: Plus, pencil: Pencil,
  "list-checks": ListChecks, "list-plus": ListPlus, star: Star, "circle-dot": CircleDot,
  "check-square": CheckSquare, square: Square, circle: Circle, "trash-2": Trash2,
  search: Search, "search-x": SearchX, eye: Eye, "file-spreadsheet": FileSpreadsheet,
  "file-text": FileText, mail: Mail, "key-round": KeyRound, "user-plus": UserPlus,
  inbox: Inbox, "rotate-ccw": RotateCcw, sun: Sun, moon: Moon,
};

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
}

export function Icon({ name, size = 16, color, strokeWidth, style, className }: IconProps) {
  const Cmp = MAP[name];
  if (!Cmp) {
    // Unknown icon name — render a same-size spacer so layout is unaffected.
    return <span aria-hidden style={{ display: "inline-block", width: size, height: size, ...style }} />;
  }
  return (
    <Cmp
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden
      style={{ flexShrink: 0, ...style }}
    />
  );
}
