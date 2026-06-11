import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ContractorShell } from "@/components/contractor/contractor-shell";
import { ContractorPortfolio } from "@/components/contractor/contractor-portfolio";
import { ContractorBidDetailView } from "@/components/contractor/contractor-bid-detail-view";
import { ContractorRatesPage } from "@/components/contractor/contractor-rates-page";
import { ContractorOnboardingForm } from "@/components/contractor/contractor-onboarding-form";
import { ContractorBusinessInfoForm } from "@/components/contractor/contractor-business-info-form";
import { ContractorClientProjectForm } from "@/components/marketing/contractor-client-project-form";
import { HomeownerDescribeForm } from "@/components/marketing/homeowner-describe-form";
import { MyProjectsBreadcrumb } from "@/components/layout/my-projects-breadcrumb";
import { PageBreadcrumbHeader } from "@/components/layout/page-breadcrumb-header";
import { ProjectList } from "@/components/project/project-list";
import { ProjectDetailView } from "@/components/project/project-detail-view";
import { ReviewedScopeDetail } from "@/components/review/reviewed-scope-detail";
import { AdminPreviewProjectSetup } from "@/components/admin/preview/admin-preview-project-setup";
import { AdminPreviewReviewWorkspace } from "@/components/admin/preview/admin-preview-review-workspace";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  previewContractorBidDetail,
  previewContractorClientProject,
  previewContractorDashboard,
  previewContractorProfile,
  previewHomeownerKitchenProject,
  previewHomeownerProjectList,
  previewHomeownerReviewedScopeDetail,
} from "@/lib/admin/fixtures";
import { getProjectPreviewContext } from "@/lib/admin/preview-context";
import type { ScreenCatalogEntry } from "@/lib/admin/screen-catalog";
import { marketingCopy } from "@/lib/marketing/copy";
import { cn } from "@/lib/utils";

export function AdminPreviewScreen({ screen }: { screen: ScreenCatalogEntry }) {
  switch (screen.id) {
    case "homeowner-projects-list":
      return (
        <AppShell>
          <HomeownerProjectsListPreview />
        </AppShell>
      );
    case "homeowner-projects-new":
      return (
        <AppShell>
          <HomeownerNewProjectPreview />
        </AppShell>
      );
    case "homeowner-project-detail":
      return (
        <AppShell>
          <Suspense fallback={<PreviewLoading />}>
            <ProjectDetailView
              project={previewHomeownerKitchenProject}
              autoGenerate={false}
              previewContext={getProjectPreviewContext(screen.id)}
            />
          </Suspense>
        </AppShell>
      );
    case "homeowner-project-setup":
      return (
        <AppShell>
          <AdminPreviewProjectSetup />
        </AppShell>
      );
    case "homeowner-project-review":
      return (
        <AppShell>
          <ReviewedScopeDetail
            projectId={previewHomeownerKitchenProject.id}
            project={previewHomeownerKitchenProject}
            scope={previewHomeownerReviewedScopeDetail}
            suggestions={previewHomeownerReviewedScopeDetail.suggestions}
            currentSummary={previewHomeownerKitchenProject.ai_summary}
            currentScopeItems={previewHomeownerKitchenProject.scope_items}
            estimate={previewContractorBidDetail.estimate}
          />
        </AppShell>
      );
    case "contractor-dashboard":
      return (
        <ContractorShell>
          <ContractorPortfolio
            clientProjects={previewContractorDashboard.clientProjects}
            accepted={previewContractorDashboard.accepted}
            inReview={previewContractorDashboard.inReview}
            history={previewContractorDashboard.history}
          />
        </ContractorShell>
      );
    case "contractor-projects-new":
      return (
        <ContractorShell>
          <ContractorNewProjectPreview />
        </ContractorShell>
      );
    case "contractor-project-detail":
      return (
        <ContractorShell>
          <Suspense fallback={<PreviewLoading />}>
            <ProjectDetailView
              project={previewContractorClientProject}
              autoGenerate={false}
              isGuestProject
              projectsBreadcrumbHref="/contractor"
            />
          </Suspense>
        </ContractorShell>
      );
    case "contractor-bid-detail":
      return (
        <ContractorShell>
          <ContractorBidDetailView bid={previewContractorBidDetail} />
        </ContractorShell>
      );
    case "contractor-business":
      return (
        <ContractorShell>
          <ContractorBusinessPreview />
        </ContractorShell>
      );
    case "contractor-rates":
      return (
        <ContractorShell>
          <ContractorRatesPage ratesApiPath="/api/admin/preview/contractor/rates" />
        </ContractorShell>
      );
    case "contractor-onboarding":
      return <ContractorOnboardingPreview />;
    case "contractor-complete-setup":
      return (
        <ContractorShell>
          <AdminPreviewContractorCompleteSetup />
        </ContractorShell>
      );
    case "contractor-review-share-link":
      return <AdminPreviewReviewWorkspace />;
    default:
      return null;
  }
}

function PreviewLoading() {
  return (
    <div className="py-12 text-sm text-[var(--muted)]">Loading preview…</div>
  );
}

function HomeownerProjectsListPreview() {
  const projects = previewHomeownerProjectList;
  const hasProjects = projects.length > 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div
          className={cn(
            "space-y-3",
            hasProjects ? "w-full md:max-w-2xl" : "max-w-2xl"
          )}
        >
          <h1 className="font-display text-4xl tracking-tight text-neutral-900 text-balance">
            Your projects
          </h1>
          <p className="text-base text-[var(--muted)]">
            Describe what you want in plain language. ScopeBuddy turns it into a
            clear scope you can share with contractors.
          </p>
        </div>
        {hasProjects ? (
          <Button asChild size="lg" className="hidden md:inline-flex">
            <Link href="/projects/new">New project</Link>
          </Button>
        ) : null}
      </div>
      <ProjectList projects={projects} />
    </div>
  );
}

function HomeownerNewProjectPreview() {
  const { homeowner } = marketingCopy.signup;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageBreadcrumbHeader breadcrumb={<MyProjectsBreadcrumb href="/projects" />}>
        <div className="space-y-2">
          <h1 className="font-display text-3xl tracking-tight text-neutral-900 text-balance sm:text-4xl">
            {homeowner.title}
          </h1>
          <p className="text-sm text-[var(--muted)] sm:text-base">
            {homeowner.subtitle}
          </p>
        </div>
      </PageBreadcrumbHeader>
      <HomeownerDescribeForm mode="dashboard" />
    </div>
  );
}

function ContractorNewProjectPreview() {
  const { getStartedContractor } = marketingCopy.signup;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageBreadcrumbHeader breadcrumb={<MyProjectsBreadcrumb href="/contractor" />}>
        <div className="space-y-2">
          <h1 className="font-display text-3xl tracking-tight text-balance text-neutral-900 sm:text-4xl">
            {getStartedContractor.title}
          </h1>
          <p className="text-sm text-[var(--muted)] sm:text-base">
            {getStartedContractor.subtitle}
          </p>
        </div>
      </PageBreadcrumbHeader>
      <Card>
        <CardContent className="p-6 md:p-8">
          <ContractorClientProjectForm mode="portal" />
        </CardContent>
      </Card>
    </div>
  );
}

function ContractorBusinessPreview() {
  const profile = previewContractorProfile;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <PageBreadcrumbHeader breadcrumb={<MyProjectsBreadcrumb href="/contractor" />}>
        <div className="space-y-2">
          <h1 className="font-display text-3xl tracking-tight text-neutral-900">
            Business info
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Update how your business appears to homeowners and keep your service
            area current for future project matching.
          </p>
        </div>
      </PageBreadcrumbHeader>
      <Card>
        <CardContent className="p-6 md:p-8">
          <ContractorBusinessInfoForm
            defaultCompanyName={profile.company_name}
            defaultContactName={profile.contact_name}
            defaultServiceArea={profile.service_area ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ContractorOnboardingPreview() {
  const profile = previewContractorProfile;

  return (
    <div className="min-h-screen bg-[var(--background)] px-[var(--page-padding-x)] py-12">
      <div className="mx-auto max-w-lg space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl tracking-tight text-balance text-neutral-900 sm:text-4xl">
            Set up your contractor profile
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Confirm your business details so ScopeBuddy can link your past and
            future project reviews.
          </p>
        </div>
        <Card>
          <CardContent className="p-6 md:p-8">
            <ContractorOnboardingForm
              defaultCompanyName={profile.company_name}
              defaultContactName={profile.contact_name}
              defaultServiceArea={profile.service_area ?? ""}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminPreviewContractorCompleteSetup() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--muted)]">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      Setting up your contractor account
    </div>
  );
}
