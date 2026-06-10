import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminAccessDenied({ message }: { message: string }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 py-16 text-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">Back to ScopeBuddy</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
