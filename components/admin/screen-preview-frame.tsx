"use client";

export function ScreenPreviewFrame({
  previewPath,
  title,
}: {
  previewPath: string;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-white shadow-sm">
      <iframe
        src={previewPath}
        title={`Preview: ${title}`}
        className="h-[min(80vh,900px)] w-full bg-[var(--background)]"
      />
    </div>
  );
}
