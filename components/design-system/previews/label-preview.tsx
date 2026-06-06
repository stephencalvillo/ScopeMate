import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PreviewSection } from "@/components/design-system/preview-section";

export function LabelPreview() {
  return (
    <PreviewSection title="With input">
      <div className="max-w-md space-y-2">
        <Label htmlFor="label-example">Contractor email</Label>
        <Input id="label-example" type="email" placeholder="name@company.com" />
      </div>
    </PreviewSection>
  );
}
