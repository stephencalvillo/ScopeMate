import { ContractorShell } from "@/components/contractor/contractor-shell";

export default function ContractorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ContractorShell>{children}</ContractorShell>;
}
