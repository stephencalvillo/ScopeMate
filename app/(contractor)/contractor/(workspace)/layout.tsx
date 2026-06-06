import { ContractorShell } from "@/components/contractor/contractor-shell";

export default function ContractorWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ContractorShell>{children}</ContractorShell>;
}
