import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

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

const isProjectDetailRoute = createRouteMatcher(["/projects/:id"]);

const guestProjectApiPattern =
  /^\/api\/projects\/[^/]+\/(generate-scope|claim|scope-items(?:\/.*)?|follow-up-questions(?:\/.*)?|photos(?:\/.*)?)$/;

function isGuestAccessibleProjectApi(request: NextRequest) {
  return guestProjectApiPattern.test(request.nextUrl.pathname);
}

function shouldProxyClerkFrontendApi(url: URL) {
  return (
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
      isGuestAccessibleProjectApi(request)
    ) {
      return;
    }

    await auth.protect();
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
