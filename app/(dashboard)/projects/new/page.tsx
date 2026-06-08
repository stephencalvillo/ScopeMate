import { HomeownerDescribeForm } from "@/components/marketing/homeowner-describe-form";
import { MyProjectsBreadcrumb } from "@/components/layout/my-projects-breadcrumb";
import { PageBreadcrumbHeader } from "@/components/layout/page-breadcrumb-header";
import { marketingCopy } from "@/lib/marketing/copy";

export default function NewProjectPage() {
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
