"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PreviewSection } from "@/components/design-system/preview-section";

export function SelectPreview() {
  return (
    <PreviewSection title="Default">
      <div className="max-w-md space-y-2">
        <Label htmlFor="select-category">Category</Label>
        <Select defaultValue="general">
          <SelectTrigger id="select-category">
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="structural">Structural</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </PreviewSection>
  );
}
