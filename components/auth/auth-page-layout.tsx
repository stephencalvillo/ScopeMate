import { GridBackground } from "@/components/marketing/grid-background";

export function AuthPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-[var(--background)] px-[var(--page-padding-x)] py-12">
      <GridBackground />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="mb-10 text-center">
          <p className="font-display text-4xl tracking-tight text-neutral-900 text-balance">
            Helping homeowners and contractors start on the same page.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
