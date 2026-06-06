"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectTypes } from "@/lib/marketing/copy";

const STORAGE_KEY = "scopemate-homeowner-signup";

export function HomeownerSignupForm() {
  const router = useRouter();
  const [projectType, setProjectType] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      projectType,
      projectDescription: String(
        formData.get("project_description") ?? ""
      ).trim(),
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    router.push("/sign-up?redirect_url=/projects/new");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Your name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project_type">Project type</Label>
        <Select value={projectType} onValueChange={setProjectType} required>
          <SelectTrigger id="project_type">
            <SelectValue placeholder="Select a project type" />
          </SelectTrigger>
          <SelectContent>
            {projectTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project_description">Project description</Label>
        <Textarea
          id="project_description"
          name="project_description"
          placeholder="Describe your project in your own words — what you want to accomplish, any concerns, and what success looks like."
          required
        />
      </div>

      <Button type="submit" size="lg" disabled={loading || !projectType}>
        {loading ? "Continuing..." : "Continue to create account"}
      </Button>
    </form>
  );
}

export { STORAGE_KEY as HOMEOWNER_SIGNUP_STORAGE_KEY };
