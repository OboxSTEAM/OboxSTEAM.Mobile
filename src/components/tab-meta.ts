import {
  Bell,
  CalendarDays,
  Circle,
  QrCode,
  Sun,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react-native";

export type TabMeta = {
  label: string;
  Icon: LucideIcon;
};

/** Shared icon/label registry keyed by Expo Router tab route name. */
const TAB_META: Record<string, TabMeta> = {
  children: { label: "Con", Icon: Users },
  notifications: { label: "Thông báo", Icon: Bell },
  profile: { label: "Tài khoản", Icon: UserRound },
  schedule: { label: "Lịch", Icon: CalendarDays },
  "check-in": { label: "Check-in", Icon: QrCode },
  today: { label: "Hôm nay", Icon: Sun },
};

export function getTabMeta(routeName: string): TabMeta {
  return TAB_META[routeName] ?? { label: routeName, Icon: Circle };
}
