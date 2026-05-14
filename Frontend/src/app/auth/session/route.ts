import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { ApiBaseAddress } from "@/config/appConfig";
import { defaultSession, ISessionData, sessionOptions } from "../lib/session";
import { setAuthCookie } from "@/helper/ServerCookieHelper";
import { log } from "node:console";
import AxiosClient from "@AxoisClient/axios-client";
import { jwtVerify } from "jose";

export async function POST(request: NextRequest) {
  const cookie = await cookies();

  try {
    const session = await getIronSession<ISessionData>(cookie, sessionOptions);
    const reqBody = await request.json();

    const res = await fetch(`${ApiBaseAddress}/api/v1/auth/login`, {
      headers: {
        accept: "*/*",
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(reqBody),
    });

    const responseData = await res.json();

    const loginUser = responseData?.data as ISessionData;

    if (
      responseData?.action === "success" &&
      loginUser?.user_id &&
      loginUser?.user_id !== ""
    ) {
      Object.entries(loginUser).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          session[key as "user_id"] = value;
        }
      });
      session.isLoggedIn = true;
      await setAuthCookie(loginUser.token);

      await session.save();
      return NextResponse.json({
        action: responseData?.action,
        title: responseData?.title,
        isLoggedIn: true,
        data: {
          user_type_code: loginUser?.user_type_code,
        },
      });
    } else {
      session.isLoggedIn = false;
      await session.save();
      return NextResponse.json({
        action: responseData?.action,
        title: responseData?.title,
        isLoggedIn: false,
        data: {
          user_type_code: loginUser?.user_type_code,
        },
      });
    }
  } catch (err: any) {
    console.error("Login API Error:", err);

    return NextResponse.json({
      action: "error",
      title: "Something went wrong",
      message: err?.message || "Internal server error",
      data: {},
    });
  }
}
function getRealOrigin(request: NextRequest) {
  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return `${proto}://${host}`;
}
export async function GET(request: NextRequest) {
  const isValid = false;
  const cookie = await cookies();
  const session = await getIronSession<ISessionData>(cookie, sessionOptions);
  const cookieToken = session.token;
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);
  let isLoggedIn = true;
  try {
    await jwtVerify(cookieToken, secretKey);
    isLoggedIn = true;
  } catch {
    isLoggedIn = false;
  }
  if (!isLoggedIn) {
    try {
      const origin = getRealOrigin(request);
      const refreshUrl = `${origin}/auth/refresh`;
      const res = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") || "",
        },
      });
      const refreshData = await res.json();
      const newToken = refreshData.token;
      if (newToken) {
        isLoggedIn = true;
        session.token = newToken;
        session.save();
      }
    } catch (error) {
      isLoggedIn = true;
    }
  }
  if (isLoggedIn) {
    try {
      const meUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/me?minimal=true`;
      const res = await fetch(meUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      });
      const dataJson = await res.json();
      const user = dataJson.data;
      if (dataJson?.action === "success") {
        const latestData = {
          ...session,
          user_type_code: user.user_type_code,
          name: user.name,
          email: user.email,
        };
        Object.entries(latestData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            session[key as "user_id"] = value;
          }
        });
      }
    } catch (err) {
      return NextResponse.json({
        action: "error",
        message: "Failed to fetch user",
        data: {},
      });
    }
    session.isLoggedIn = isLoggedIn;
    session.save();
    return NextResponse.json(session);
  } else {
    return NextResponse.json({
      ...defaultSession,
      message: "Not authenticated",
    });
  }
}
export async function DELETE() {
  const cookieStore = await cookies();
  const session = await getIronSession<ISessionData>(
    cookieStore,
    sessionOptions,
  );
  await session.destroy();
  const authTokenName = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME;
  const isProd = process.env.NODE_ENV === "production";
  if (authTokenName) {
    cookieStore.set(authTokenName, "", {
      maxAge: -1,
      path: "/",
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
  }
  return Response.json(defaultSession);
}
