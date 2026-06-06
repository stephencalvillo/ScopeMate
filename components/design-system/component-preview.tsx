import type { ComponentDefinition } from "@/lib/component-library";
import { BadgePreview } from "@/components/design-system/previews/badge-preview";
import { ButtonPreview } from "@/components/design-system/previews/button-preview";
import { CardPreview } from "@/components/design-system/previews/card-preview";
import { DialogPreview } from "@/components/design-system/previews/dialog-preview";
import { InputPreview } from "@/components/design-system/previews/input-preview";
import { LabelPreview } from "@/components/design-system/previews/label-preview";
import { SelectPreview } from "@/components/design-system/previews/select-preview";
import { TextareaPreview } from "@/components/design-system/previews/textarea-preview";

const previewMap = {
  button: ButtonPreview,
  input: InputPreview,
  textarea: TextareaPreview,
  label: LabelPreview,
  select: SelectPreview,
  badge: BadgePreview,
  dialog: DialogPreview,
  card: CardPreview,
} as const;

export function ComponentPreview({
  component,
}: {
  component: ComponentDefinition;
}) {
  const Preview = previewMap[component.slug as keyof typeof previewMap];

  return (
    <div className="space-y-8">
      <header className="space-y-3 border-b border-[var(--border)] pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
          {component.category}
        </p>
        <h1 className="font-display text-3xl tracking-tight text-neutral-900">
          {component.name}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          {component.description}
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
          <p>
            <span className="font-medium text-neutral-900">Source:</span>{" "}
            <code className="rounded-[4px] bg-neutral-100 px-1.5 py-0.5">
              {component.sourcePath}
            </code>
          </p>
          <p>
            <span className="font-medium text-neutral-900">Exports:</span>{" "}
            {component.exports.join(", ")}
          </p>
        </div>
      </header>

      {Preview ? <Preview /> : null}
    </div>
  );
}
