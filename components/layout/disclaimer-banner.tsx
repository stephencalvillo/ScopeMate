export function DisclaimerBanner() {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--accent)]/40 px-[var(--page-padding-x)] py-2.5 text-sm text-[var(--accent-foreground)]">
      <p>
        ScopeMate is a planning tool. It does not provide engineering,
        architectural, permit, or final pricing advice. Contractors are
        responsible for verifying scope and pricing.
      </p>
    </div>
  );
}
