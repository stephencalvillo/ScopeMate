"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Briefcase, Home } from "lucide-react";

export function AccountMenu() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-8 w-8 shrink-0 rounded-full bg-neutral-200"
        aria-hidden
      />
    );
  }

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Homeowner projects"
          labelIcon={<Home className="h-4 w-4" aria-hidden />}
          href="/projects"
        />
        <UserButton.Link
          label="Contractor portal"
          labelIcon={<Briefcase className="h-4 w-4" aria-hidden />}
          href="/contractor"
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
