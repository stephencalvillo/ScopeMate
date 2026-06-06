export type ComponentCategory = "actions" | "forms" | "feedback" | "layout";

export type ComponentDefinition = {
  slug: string;
  name: string;
  description: string;
  category: ComponentCategory;
  sourcePath: string;
  exports: string[];
};

export const componentCategories: Record<
  ComponentCategory,
  { label: string; description: string }
> = {
  actions: {
    label: "Actions",
    description: "Interactive controls that trigger actions.",
  },
  forms: {
    label: "Forms",
    description: "Inputs and controls for collecting user data.",
  },
  feedback: {
    label: "Feedback",
    description: "Status, alerts, and overlay patterns.",
  },
  layout: {
    label: "Layout",
    description: "Containers and structural building blocks.",
  },
};

export const componentLibrary: ComponentDefinition[] = [
  {
    slug: "button",
    name: "Button",
    description:
      "Primary action control with default, secondary, outline, ghost, and destructive variants.",
    category: "actions",
    sourcePath: "components/ui/button.tsx",
    exports: ["Button"],
  },
  {
    slug: "input",
    name: "Input",
    description: "Single-line text field with 4px corner radius and focus ring.",
    category: "forms",
    sourcePath: "components/ui/input.tsx",
    exports: ["Input"],
  },
  {
    slug: "textarea",
    name: "Textarea",
    description: "Multi-line text field for longer project descriptions and notes.",
    category: "forms",
    sourcePath: "components/ui/textarea.tsx",
    exports: ["Textarea"],
  },
  {
    slug: "label",
    name: "Label",
    description: "Accessible form label tied to inputs via htmlFor.",
    category: "forms",
    sourcePath: "components/ui/label.tsx",
    exports: ["Label"],
  },
  {
    slug: "select",
    name: "Select",
    description: "Dropdown selection built on Radix UI with keyboard support.",
    category: "forms",
    sourcePath: "components/ui/select.tsx",
    exports: ["Select", "SelectTrigger", "SelectContent", "SelectItem", "SelectValue"],
  },
  {
    slug: "badge",
    name: "Badge",
    description: "Compact status pill for categories, tags, and verification states.",
    category: "feedback",
    sourcePath: "components/ui/badge.tsx",
    exports: ["Badge"],
  },
  {
    slug: "dialog",
    name: "Dialog",
    description: "Modal overlay for confirmations and focused tasks.",
    category: "feedback",
    sourcePath: "components/ui/dialog.tsx",
    exports: ["Dialog", "DialogTrigger", "DialogContent", "DialogHeader", "DialogTitle"],
  },
  {
    slug: "card",
    name: "Card",
    description: "Grouped content container with header, title, description, and body slots.",
    category: "layout",
    sourcePath: "components/ui/card.tsx",
    exports: ["Card", "CardHeader", "CardTitle", "CardDescription", "CardContent"],
  },
];

export function getComponentBySlug(slug: string): ComponentDefinition | undefined {
  return componentLibrary.find((component) => component.slug === slug);
}

export function getComponentsByCategory(
  category: ComponentCategory
): ComponentDefinition[] {
  return componentLibrary.filter((component) => component.category === category);
}

export const componentLibrarySlugs = componentLibrary.map(
  (component) => component.slug
);
