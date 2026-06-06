import { Badge } from "@/components/ui/badge";
import { PreviewSection } from "@/components/design-system/preview-section";

export function BadgePreview() {
  return (
    <PreviewSection title="Variants">
      <div className="flex flex-wrap gap-3">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    </PreviewSection>
  );
}
