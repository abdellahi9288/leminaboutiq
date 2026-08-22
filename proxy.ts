import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Login page — redirect to dashboard if already authenticated
  if (pathname === "/login") {
    if (token) {
      try {
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // Invalid token — clear it and stay on login
        const response = addSecurityHeaders(NextResponse.next());
        response.cookies.delete("token");
        return response;
      }
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // Root redirects to dashboard
  if (pathname === "/") {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    try {
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // Protected dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      await jwtVerify(token, secret);
      return addSecurityHeaders(NextResponse.next());
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // Protected API routes (except auth endpoints)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    if (!token) {
      return addSecurityHeaders(
        NextResponse.json({ error: "غير مسجل" }, { status: 401 })
      );
    }
    try {
      await jwtVerify(token, secret);
      return addSecurityHeaders(NextResponse.next());
    } catch {
      const response = addSecurityHeaders(
        NextResponse.json({ error: "انتهت الجلسة" }, { status: 401 })
      );
      response.cookies.delete("token");
      return response;
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/api/:path*"],
};
