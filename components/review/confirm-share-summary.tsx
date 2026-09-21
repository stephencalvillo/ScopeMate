"use client";

import { useState } from "react";
import { ChevronDown, ImagePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatFollowUpAnswer } from "@/lib/follow-up/format-answer";
import { formatProjectLocation } from "@/lib/location/parse";
import { cn, formatCategoryLabel } from "@/lib/utils";
import type { ProjectPhotoWithUrl } from "@/lib/phase2/client";
import type { ScopeCategoryGroup } from "@/lib/scope/group-by-category";
import { formatProjectTypeLabel, type FollowUpQuestion, type Project } from "@/types";

const MAX_VISIBLE_THUMBS = 4;

function SnapshotPhoto({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <QuietPhotoSlot className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function QuietPhotoSlot({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[8px] border border-dashed border-[var(--border)] bg-neutral-50",
        className
      )}
      aria-hidden
    >
      <ImagePlus className="h-5 w-5 text-neutral-300" />
    </div>
  );
}

function SnapshotIdentity({
  title,
  typeLabel,
  heroPhoto,
}: {
  title: string;
  typeLabel: string;
  heroPhoto?: ProjectPhotoWithUrl;
}) {
  return (
    <>
      {heroPhoto ? (
        <SnapshotPhoto
          src={heroPhoto.url}
          alt={heroPhoto.file_name}
          className="h-14 w-14 shrink-0 rounded-[8px] object-cover lg:h-16 lg:w-16"
        />
      ) : (
        <QuietPhotoSlot className="h-14 w-14 shrink-0 lg:h-16 lg:w-16" />
      )}
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="font-display text-base leading-6 tracking-tight text-neutral-900 lg:text-lg">
          {title}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{typeLabel}</p>
      </div>
    </>
  );
}

function FactRow({
  label,
  value,
  stacked = false,
}: {
  label: string;
  value: string;
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <div className="space-y-0.5">
        <p className="text-sm leading-5 text-[var(--muted)]">{label}</p>
        <p className="text-sm leading-6 text-neutral-900">{value}</p>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <p className="min-w-0 flex-1 text-sm leading-6 text-[var(--muted)]">
        {label}
      </p>
      <p className="shrink-0 text-right text-sm leading-6 text-neutral-900">
        {value}
      </p>
    </div>
  );
}

export function ConfirmShareSummary({
  project,
  summary,
  showSummary,
  answeredQuestions,
  photos,
  scopeGroups,
  showScope,
}: {
  project: Pick<Project, "title" | "project_type" | "city" | "zip" | "location">;
  summary: string | null;
  showSummary: boolean;
  answeredQuestions: FollowUpQuestion[];
  photos: ProjectPhotoWithUrl[];
  scopeGroups: ScopeCategoryGroup[];
  showScope: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = formatProjectLocation(project);
  const typeLabel = formatProjectTypeLabel(project.project_type);
  const extraPhotos = photos.slice(1, MAX_VISIBLE_THUMBS + 1);
  const extraPhotoCount = Math.max(0, photos.length - 1 - MAX_VISIBLE_THUMBS);
  const itemCount = scopeGroups.reduce(
    (total, group) => total + group.items.length,
    0
  );
  const confirmedSummary = showSummary ? summary?.trim() : "";
  const showAbout = Boolean(confirmedSummary);
  const showDetails = answeredQuestions.length > 0;
  const showScopeSection = showScope && itemCount > 0;
  const heroPhoto = photos[0];

  return (
    <Card className="p-[var(--card-padding)]">
      <button
        type="button"
        className="flex w-full items-start gap-3 rounded-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 lg:hidden"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((open) => !open)}
      >
        <SnapshotIdentity
          title={project.title}
          typeLabel={typeLabel}
          heroPhoto={heroPhoto}
        />
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-300 ease-out",
            mobileOpen && "rotate-180"
          )}
          aria-hidden
        />
        <span className="sr-only">Project snapshot</span>
      </button>
      <div className="hidden items-start gap-3 lg:flex">
        <SnapshotIdentity
          title={project.title}
          typeLabel={typeLabel}
          heroPhoto={heroPhoto}
        />
      </div>

      <div className={cn(!mobileOpen && "max-lg:hidden")}>
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <FactRow label="Location" value={location} />
        </div>

        {photos.length > 1 ? (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="mb-3 text-sm text-[var(--muted)]">Photos</p>
            <div className="flex gap-2">
              {extraPhotos.map((photo) => (
                <SnapshotPhoto
                  key={photo.id}
                  src={photo.url}
                  alt={photo.file_name}
                  className="h-12 w-12 rounded-[8px] object-cover"
                />
              ))}
              {extraPhotoCount > 0 ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-neutral-50 text-sm text-[var(--muted)]">
                  +{extraPhotoCount}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {showAbout ? (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="mb-2 text-sm text-[var(--muted)]">Summary</p>
            <p className="line-clamp-4 text-sm leading-6 text-neutral-800">
              {confirmedSummary}
            </p>
          </div>
        ) : null}

        {showDetails ? (
          <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
            <p className="text-sm text-[var(--muted)]">Details</p>
            {answeredQuestions.map((question) => (
              <FactRow
                key={question.id}
                stacked
                label={question.question.replace(/\?+$/, "")}
                value={formatFollowUpAnswer(question, project.project_type)}
              />
            ))}
          </div>
        ) : null}

        {itemCount > 0 ? (
          <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-[var(--muted)]">Scope</p>
              <p className="text-sm text-neutral-900">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </div>
            {showScopeSection
              ? scopeGroups.map((group) => (
                  <FactRow
                    key={group.category}
                    label={formatCategoryLabel(group.category)}
                    value={String(group.items.length)}
                  />
                ))
              : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
