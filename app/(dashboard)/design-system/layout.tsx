import { DesignSystemShell } from "@/components/design-system/design-system-shell";

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesignSystemShell>{children}</DesignSystemShell>;
}
