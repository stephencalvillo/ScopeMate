"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ScopeCategoryLabel } from "@/components/scope/scope-category-label";

export function ScopeCategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-44 bg-white text-sm">
        {value === "all" ? (
          <span>All categories</span>
        ) : (
          <ScopeCategoryLabel category={value} />
        )}
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="all">All categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            <ScopeCategoryLabel category={category} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
