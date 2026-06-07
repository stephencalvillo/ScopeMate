import {
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
} from "@clerk/nextjs";

function AuthClerkPlaceholder({ message }: { message: string }) {
  return (
    <div className="w-full rounded-[8px] border border-[#e8e8e4] bg-white px-6 py-10 text-center shadow-none">
      <p className="text-sm text-neutral-600">{message}</p>
    </div>
  );
}

export function AuthClerkForm({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkLoading>
        <AuthClerkPlaceholder message="Loading secure sign-in…" />
      </ClerkLoading>
      <ClerkFailed>
        <AuthClerkPlaceholder message="We couldn’t load sign-in. Refresh the page or try again in a moment." />
      </ClerkFailed>
      <ClerkLoaded>{children}</ClerkLoaded>
    </>
  );
}
