export function HowItWorksPreviewFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="how-it-works-preview-backdrop absolute inset-2 overflow-hidden rounded-2xl p-4 md:p-5">
      {children}
    </div>
  );
}
