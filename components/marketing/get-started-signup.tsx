"use client";

import { useState } from "react";
import { ContractorClientProjectForm } from "@/components/marketing/contractor-client-project-form";
import {
  GetStartedRoleToggle,
  type GetStartedRole,
} from "@/components/marketing/get-started-role-toggle";
import { HomeownerDescribeForm } from "@/components/marketing/homeowner-describe-form";
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
    <div className="space-y-6">
      <GetStartedRoleToggle value={role} onChange={setRole} />

      <div className="space-y-2 text-left">
        <h2 className="font-display text-lg tracking-tight text-neutral-900 text-balance">
          {copy.title}
        </h2>
        <p className="text-sm text-[var(--muted)]">{copy.subtitle}</p>
      </div>

      {role === "homeowner" ? (
        <HomeownerDescribeForm />
      ) : (
        <ContractorClientProjectForm />
      )}
    </div>
  );
}
