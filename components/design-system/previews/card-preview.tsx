import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PreviewSection } from "@/components/design-system/preview-section";

export function CardPreview() {
  return (
    <PreviewSection title="Default">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Your first project starts here</CardTitle>
          <CardDescription>
            Describe what you want to build in your own words. ScopeMate turns
            your notes into a clear scope you can share with contractors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Create a project</Button>
        </CardContent>
      </Card>
    </PreviewSection>
  );
}
