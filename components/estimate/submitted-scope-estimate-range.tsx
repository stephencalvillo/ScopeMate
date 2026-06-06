import { EstimateRangeInputs } from "@/components/estimate/estimate-range-inputs";
import { cn } from "@/lib/utils";

export function SubmittedScopeEstimateRange({
  laborCost,
  materialCost,
  className,
}: {
  laborCost: number | string;
  materialCost: number | string;
  className?: string;
}) {
  return (
    <EstimateRangeInputs
      className={cn("shrink-0 md:w-[15rem] md:justify-self-end", className)}
      minValue={String(laborCost)}
      maxValue={String(materialCost)}
      readOnly
    />
  );
}
