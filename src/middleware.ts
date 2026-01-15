import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;
  const isApiRoute = path.startsWith("/api/");

  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
      if (isApiRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (path.startsWith("/teacher") || path.startsWith("/api/teacher")) {
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (
      token.role !== "TEACHER" &&
      token.role !== "ADMIN" &&
      token.role !== "SUPER_ADMIN"
    ) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (path.startsWith("/parent") || path.startsWith("/api/parent")) {
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (
      token.role !== "PARENT" &&
      token.role !== "ADMIN" &&
      token.role !== "SUPER_ADMIN"
    ) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (path.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/parent/:path*",
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/teacher/:path*",
    "/api/parent/:path*",
  ],
};
