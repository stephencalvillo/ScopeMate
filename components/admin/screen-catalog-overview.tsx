import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  countScreensByAudience,
  type ScreenAudience,
} from "@/lib/admin/screen-catalog";

const audienceMeta: Record<
  ScreenAudience,
  { title: string; description: string; href: string }
> = {
  homeowner: {
    title: "Homeowner screens",
    description:
      "Dashboard, project workspace, proposals, and onboarding flows for homeowners.",
    href: "/adminpanel/screens/homeowner",
  },
  contractor: {
    title: "Contractor screens",
    description:
      "Portal, client projects, bids, settings, and share-link review flows.",
    href: "/adminpanel/screens/contractor",
  },
};

export function ScreenCatalogOverview() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Screen catalog
          </p>
          <h1 className="font-display text-3xl tracking-tight text-neutral-900">
            User-facing screens
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Browse every primary page homeowners and contractors see. Click a
            screen thumbnail to preview it with mock data in a modal.
          </p>
        </div>
        <Link
          href="/adminpanel"
          className="text-sm text-neutral-700 underline-offset-4 hover:underline"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(Object.keys(audienceMeta) as ScreenAudience[]).map((audience) => {
          const meta = audienceMeta[audience];
          const count = countScreensByAudience(audience);

          return (
            <Link key={audience} href={meta.href} className="group block">
              <Card className="h-full transition hover:border-neutral-300">
                <CardHeader>
                  <CardDescription>{count} screens</CardDescription>
                  <CardTitle className="group-hover:text-neutral-700">
                    {meta.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--muted)]">{meta.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
