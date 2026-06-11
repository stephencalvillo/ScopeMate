import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveClerkUserId } from "@/lib/auth/clerk";

const isPublicRoute = createRouteMatcher([
  "/",
  "/homeowners(.*)",
  "/contractors(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/share(.*)",
  "/review(.*)",
  "/api/share(.*)",
  "/api/review(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/projects/guest",
]);

const isProjectDetailRoute = createRouteMatcher([
  "/projects/:id",
  "/projects/:id/setup",
]);

const isAdminPanelRoute = createRouteMatcher(["/adminpanel(.*)"]);

const guestProjectApiPattern =
  /^\/api\/projects\/[^/]+\/(generate-scope|claim|guest-token|scope-items(?:\/.*)?|follow-up-questions(?:\/.*)?|photos(?:\/.*)?)$/;

function isGuestAccessibleProjectApi(request: NextRequest) {
  return guestProjectApiPattern.test(request.nextUrl.pathname);
}

function isServerActionRequest(request: NextRequest) {
  return (
    request.method === "POST" &&
    (request.headers.has("Next-Action") || request.headers.has("next-action"))
  );
}

function shouldProxyClerkFrontendApi(url: URL) {
  return (
    url.hostname === "scopebuddy.ai" ||
    url.hostname === "www.scopebuddy.ai" ||
    url.hostname === "myscopemate.ai" ||
    url.hostname === "www.myscopemate.ai" ||
    url.hostname.endsWith(".vercel.app")
  );
}

export default clerkMiddleware(
  async (auth, request) => {
    if (
      isPublicRoute(request) ||
      isProjectDetailRoute(request) ||
      isGuestAccessibleProjectApi(request) ||
      isServerActionRequest(request)
    ) {
      return;
    }

    if (isAdminPanelRoute(request)) {
      const { userId: authUserId } = await auth();
      const userId = authUserId ?? (await resolveClerkUserId(request));
      if (!userId) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("redirect_url", "/adminpanel");
        return NextResponse.redirect(signInUrl);
      }
      return;
    }

    if (request.nextUrl.pathname.startsWith("/api/")) {
      // Route handlers authenticate with auth() directly. Middleware auth()
      // does not reliably see Clerk sessions for API requests on scopebuddy.ai.
      return;
    }

    const { userId: authUserId, redirectToSignIn } = await auth();
    const userId = authUserId ?? (await resolveClerkUserId(request));
    if (!userId) {
      return redirectToSignIn();
    }
  },
  {
    frontendApiProxy: {
      enabled: shouldProxyClerkFrontendApi,
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
