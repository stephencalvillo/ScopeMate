import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReviewExpiredNotice() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This review link is no longer available</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--muted)]">
          The invitation may have expired, been revoked, or is no longer valid.
          Ask the homeowner to send a new invitation.
        </p>
      </CardContent>
    </Card>
  );
}
