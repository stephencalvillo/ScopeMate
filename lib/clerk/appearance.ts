import { isGoogleAuthEnabled } from "@/lib/clerk/google-auth-enabled";

export const clerkAppearance = {
  variables: {
    colorPrimary: "#171717",
    colorText: "#171717",
    colorTextSecondary: "#6b6b6b",
    colorBackground: "#fafaf8",
    colorInputBackground: "#ffffff",
    colorInputText: "#171717",
    borderRadius: "4px",
    fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    card: "shadow-none border border-[#e8e8e4] rounded-[8px]",
    headerTitle: "font-[family-name:var(--font-lexend)] tracking-tight",
    formButtonPrimary:
      "bg-neutral-900 hover:bg-neutral-800 text-white normal-case text-sm",
    footerActionLink: "text-neutral-900 hover:text-neutral-700",
  },
};

export function getClerkAppearance() {
  if (isGoogleAuthEnabled()) {
    return clerkAppearance;
  }

  return {
    ...clerkAppearance,
    elements: {
      ...clerkAppearance.elements,
      socialButtonsRoot: "hidden !important",
      socialButtonsBlockButton: "hidden !important",
      socialButtonsIconButton: "hidden !important",
      dividerRow: "hidden !important",
      dividerLine: "hidden !important",
      dividerText: "hidden !important",
    },
  };
}
