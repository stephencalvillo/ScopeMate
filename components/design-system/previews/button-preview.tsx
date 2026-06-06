import { Button } from "@/components/ui/button";
import { PreviewSection } from "@/components/design-system/preview-section";

export function ButtonPreview() {
  return (
    <div className="space-y-8">
      <PreviewSection title="Variants">
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </PreviewSection>

      <PreviewSection title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </PreviewSection>

      <PreviewSection title="States">
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled outline
          </Button>
        </div>
      </PreviewSection>
    </div>
  );
}
