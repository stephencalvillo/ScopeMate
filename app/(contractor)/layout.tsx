import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";

export default function ContractorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <DisclaimerBanner />
      {children}
    </div>
  );
}
