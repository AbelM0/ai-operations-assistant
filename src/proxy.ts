import { clerkMiddleware } from "@clerk/nextjs/server";
import { updateSession } from "@/utils/supabase/middleware";

// Authentication and authorization belong beside each protected resource.
// Proxy only keeps Supabase cookies fresh and initializes Clerk request state.
export default clerkMiddleware(async (_auth, request) => updateSession(request));

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
