import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ISessionData, sessionOptions } from "@app/auth/lib/session";
import { getIronSession } from "iron-session";

const accessTokenExpiryMinutes = parseInt(
  process.env.JWT_EXPIRES_IN?.replace("m", "") || "15",
  10,
);
const maxAgeSeconds = accessTokenExpiryMinutes * 60;

const redirectToLogin = (
  request: NextRequest,
  isSessionClear: boolean = true,
) => {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.headers.set("x-middleware-cache", "no-cache");
  response.cookies.set(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME!, "", {
    maxAge: -1,
    path: "/",
  });
  if (isSessionClear) {
    response.cookies.set(sessionOptions.cookieName, "", {
      maxAge: -1,
      path: "/",
    });
  }
  return response;
};

function getRealOrigin(request: NextRequest) {
  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  return `${proto}://${host}`;
}

const refreshToken = async (
  request: NextRequest,
  isRedirectToDashboard: boolean = false,
  defaultRedirect?: string,
) => {
  const cookieHeader = request.headers.get("cookie") ?? "";

  try {
    if (cookieHeader && cookieHeader !== "" && cookieHeader?.length > 0) {
      const origin = getRealOrigin(request);

      const refreshRes = await fetch(`${origin}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieHeader,
        },
      });

      const refreshData = await refreshRes.json();

      if (refreshRes.ok && refreshData?.action === "success") {
        const token = refreshData.token;

        console.log("refreshData-ppp-", "Token Refreshed");

        const response = isRedirectToDashboard
          ? NextResponse.redirect(new URL(defaultRedirect ?? "/", request.url))
          : NextResponse.next({
              request: {
                headers: request.headers,
              },
            });

        if (isRedirectToDashboard) {
          response.headers.set("x-middleware-cache", "no-cache");
        }

        const isProd = process.env.NODE_ENV === "production";

        response.cookies.set(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME!, token, {
          httpOnly: true,
          secure: isProd,
          maxAge: maxAgeSeconds,
          path: "/",
          sameSite: isProd ? "none" : "lax",
        });

        return response;
      } else {
        console.log("refreshData--", "Faled Token Refreshed - 1");

        return redirectToLogin(request);
      }
    } else {
      console.log("refreshData--", "Faled Token Refreshed - 2");

      return redirectToLogin(request, false);
    }
  } catch (e) {
    console.log(
      "refreshData--",
      "Faled Token Refreshed - 3",
      request.nextUrl.origin,
      "--",
      cookieHeader,
      e,
    );

    return redirectToLogin(request, true);
  }
};

export async function proxy(request: NextRequest) {
  const publicRoutes = [
    "/login",
    "/signup",
    "/privacy-policy",
    "/terms",
    "/",
    "/books",
    "/books/*",
    "/term_and_condition",
    "/contact_us",
  ];
  const currentPath = request.nextUrl.pathname;

  if (publicRoutes.includes(currentPath) || currentPath.startsWith("/books/")) {
    return NextResponse.next();
  }

  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);

  const cookieStore = await cookies();
  const token = cookieStore.get(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME!,
  )?.value;

  const session = await getIronSession<ISessionData>(
    cookieStore,
    sessionOptions,
  );
  const defaultRedirect = "/";

  if (currentPath === "/login") {
    if (!session?.user_id || session?.user_id === "") {
      return NextResponse.next();
    }

    if (token) {
      try {
        await jwtVerify(token, secretKey);
        return NextResponse.redirect(new URL(defaultRedirect, request.url));
      } catch {
        return await refreshToken(request, true, defaultRedirect);
      }
    }
    return await refreshToken(request, true, defaultRedirect);
  }

  try {
    if (token && session?.user_id && session?.user_id !== "") {
      await jwtVerify(token, secretKey);
      return NextResponse.next();
    }
    throw new Error("Token missing");
  } catch (e) {
    if (!session?.user_id || session?.user_id === "") {
      return redirectToLogin(request, true);
    }
    console.log("refreshData--", "Faled Token Refreshed - 5", e);
    return await refreshToken(request);
  }
}

export const config = {
  matcher: [
    "/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
