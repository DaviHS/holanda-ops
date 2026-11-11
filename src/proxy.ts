import { NextResponse } from "next/server";
import { authProxy } from "@/server/auth/edge";

const SIGN_IN = "/sign-in";
const HOME = "/";

export default authProxy((request) => {
  const { nextUrl, auth: session } = request;
  const { pathname, search } = nextUrl;
  const isLoggedIn = !!session?.user;

  if (pathname.startsWith(SIGN_IN)) {
    if (isLoggedIn) return NextResponse.redirect(new URL(HOME, nextUrl));
    return NextResponse.next();
  }

  if (pathname.startsWith("/register")) return NextResponse.next();

  if (!isLoggedIn) {
    const signIn = new URL(SIGN_IN, nextUrl);
    signIn.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|sw.js|manifest.webmanifest|robots.txt|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
