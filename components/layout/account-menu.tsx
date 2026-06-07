"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Briefcase, Home, UserPlus } from "lucide-react";

type AccountMenuProps = {
  variant?: "homeowner" | "contractor";
};

export function AccountMenu({ variant = "homeowner" }: AccountMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [hasContractorProfile, setHasContractorProfile] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    let cancelled = false;

    async function loadContractorProfile() {
      try {
        const response = await fetch("/api/contractor/profile");
        if (!response.ok) {
          if (!cancelled) {
            setHasContractorProfile(false);
          }
          return;
        }

        const data = (await response.json()) as { profile: unknown };
        if (!cancelled) {
          setHasContractorProfile(Boolean(data.profile));
        }
      } catch {
        if (!cancelled) {
          setHasContractorProfile(false);
        }
      }
    }

    void loadContractorProfile();

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div
        className="h-8 w-8 shrink-0 rounded-full bg-neutral-200"
        aria-hidden
      />
    );
  }

  const showCustomLinks = hasContractorProfile !== null;

  return (
    <UserButton>
      {showCustomLinks ? (
        <UserButton.MenuItems>
          {variant === "contractor" ? (
            <UserButton.Link
              label="Homeowner projects"
              labelIcon={<Home className="h-4 w-4" aria-hidden />}
              href="/projects"
            />
          ) : null}
          {variant === "homeowner" && hasContractorProfile ? (
            <UserButton.Link
              label="Contractor portal"
              labelIcon={<Briefcase className="h-4 w-4" aria-hidden />}
              href="/contractor"
            />
          ) : null}
          {variant === "homeowner" && !hasContractorProfile ? (
            <UserButton.Link
              label="Create contractor account"
              labelIcon={<UserPlus className="h-4 w-4" aria-hidden />}
              href="/contractor/onboarding"
            />
          ) : null}
        </UserButton.MenuItems>
      ) : null}
    </UserButton>
  );
}
