import { PostSignupProjectSetup } from "@/components/project/post-signup-project-setup";

export default async function ProjectSetupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ share?: string; guest_token?: string }>;
}) {
  const { id } = await params;
  const { share, guest_token: guestToken } = await searchParams;

  return (
    <PostSignupProjectSetup
      projectId={id}
      openShare={share === "1"}
      guestToken={guestToken ?? null}
    />
  );
}
