"use client";

import { UserButton } from "@clerk/nextjs";
import { Briefcase, Home } from "lucide-react";

export function AccountMenu() {
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
