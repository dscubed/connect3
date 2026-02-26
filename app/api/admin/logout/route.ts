import { ADMIN_COOKIE_NAME } from "@/lib/admin/session";
import { NextResponse } from "next/server";

export async function POST() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const response = NextResponse.redirect(new URL("/admin/login", siteUrl));
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
