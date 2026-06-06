import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ShareExpiredNotice() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This link is no longer available</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--muted)]">
          The homeowner may have turned off sharing, regenerated the link, or
          the link may have expired. Ask them to send a new link.
        </p>
      </CardContent>
    </Card>
  );
}
