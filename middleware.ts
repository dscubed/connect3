/* eslint-disable @typescript-eslint/no-unused-vars */
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!pathname.startsWith("/admin/login")) {
      const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
      const session = token ? await verifyAdminToken(token) : null;
      if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  return await updateSession(request);
}

// export function middleware(request: NextRequest) {
//   if (request.nextUrl.pathname === "/") {
//     return NextResponse.redirect(
//       'https://waitlist.connect3.app/',
//       302
//     )
//   }
// }

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
