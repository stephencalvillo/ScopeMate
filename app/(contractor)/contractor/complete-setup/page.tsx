import { ContractorCompleteSetupPage } from "@/components/contractor/contractor-complete-setup-page";
import { ContractorShell } from "@/components/contractor/contractor-shell";

export default function ContractorCompleteSetupRoute() {
  return (
    <ContractorShell>
      <ContractorCompleteSetupPage />
    </ContractorShell>
  );
}
