import {
  AirVent,
  Building2,
  CircleEllipsis,
  ClipboardCheck,
  Droplets,
  Frame,
  House,
  Lamp,
  LandPlot,
  Layers,
  LayoutGrid,
  Paintbrush,
  Pickaxe,
  Ruler,
  SquareStack,
  Trash2,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SCOPE_CATEGORIES } from "@/types";

const SCOPE_CATEGORY_ICONS: Record<
  (typeof SCOPE_CATEGORIES)[number],
  LucideIcon
> = {
  demolition: Pickaxe,
  structural: Building2,
  plumbing: Droplets,
  electrical: Zap,
  hvac: AirVent,
  carpentry: Ruler,
  drywall: Layers,
  flooring: LayoutGrid,
  tile: SquareStack,
  hardscape: LandPlot,
  painting: Paintbrush,
  fixtures: Lamp,
  permits: ClipboardCheck,
  cleanup: Trash2,
  other: House,
};

const EXTENDED_CATEGORY_ICONS: Record<string, LucideIcon> = {
  kitchen: Utensils,
  window: Frame,
  windows: Frame,
};

export function getScopeCategoryIcon(category: string): LucideIcon {
  if (category in SCOPE_CATEGORY_ICONS) {
    return SCOPE_CATEGORY_ICONS[category as keyof typeof SCOPE_CATEGORY_ICONS];
  }

  if (category in EXTENDED_CATEGORY_ICONS) {
    return EXTENDED_CATEGORY_ICONS[category];
  }

  return CircleEllipsis;
}
