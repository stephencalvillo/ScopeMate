import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PreviewSection } from "@/components/design-system/preview-section";

export function TextareaPreview() {
  return (
    <div className="space-y-8">
      <PreviewSection title="Default">
        <div className="max-w-xl space-y-2">
          <Label htmlFor="textarea-default">Project description</Label>
          <Textarea
            id="textarea-default"
            placeholder="Describe what you want to build in plain language..."
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Disabled">
        <Textarea
          className="max-w-xl"
          placeholder="Disabled textarea"
          disabled
        />
      </PreviewSection>
    </div>
  );
}
