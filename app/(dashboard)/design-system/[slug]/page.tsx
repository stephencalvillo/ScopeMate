import { notFound } from "next/navigation";
import { ComponentPreview } from "@/components/design-system/component-preview";
import {
  componentLibrary,
  getComponentBySlug,
} from "@/lib/component-library";

export function generateStaticParams() {
  return componentLibrary.map((component) => ({
    slug: component.slug,
  }));
}

export default async function DesignSystemComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const component = getComponentBySlug(slug);

  if (!component) {
    notFound();
  }

  return <ComponentPreview component={component} />;
}
