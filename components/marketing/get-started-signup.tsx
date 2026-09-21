"use client";

import { useState } from "react";
import { ContractorClientProjectForm } from "@/components/marketing/contractor-client-project-form";
import {
  GetStartedRoleToggle,
  type GetStartedRole,
} from "@/components/marketing/get-started-role-toggle";
import { HomeownerDescribeForm } from "@/components/marketing/homeowner-describe-form";
import { Card, CardContent } from "@/components/ui/card";
import { marketingCopy } from "@/lib/marketing/copy";

export function GetStartedSignup({
  initialRole = "homeowner",
}: {
  initialRole?: GetStartedRole;
}) {
  const [role, setRole] = useState<GetStartedRole>(initialRole);
  const { signup } = marketingCopy;
  const copy =
    role === "homeowner" ? signup.homeowner : signup.getStartedContractor;

  return (
    <div className="space-y-4">
      <GetStartedRoleToggle value={role} onChange={setRole} />

      <Card>
        <CardContent className="space-y-6 p-6 md:p-8">
          <h2 className="text-left font-display text-lg tracking-tight text-neutral-900 text-balance">
            {copy.title}
          </h2>

          {role === "homeowner" ? (
            <HomeownerDescribeForm />
          ) : (
            <ContractorClientProjectForm />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
