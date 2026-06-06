import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PreviewSection } from "@/components/design-system/preview-section";

export function InputPreview() {
  return (
    <div className="space-y-8">
      <PreviewSection title="Default">
        <div className="max-w-md space-y-2">
          <Label htmlFor="input-default">Project name</Label>
          <Input id="input-default" placeholder="Kitchen remodel" />
        </div>
      </PreviewSection>

      <PreviewSection title="States">
        <div className="grid max-w-md gap-4">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled input" disabled />
        </div>
      </PreviewSection>
    </div>
  );
}
