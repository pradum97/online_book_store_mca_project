"use server";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { ApiBaseAddress } from "@/config/appConfig";
import { ISessionData, sessionOptions } from "../lib/session";
import { setAuthCookie } from "@/helper/ServerCookieHelper";
export async function POST(request: NextRequest) {
  const res = NextResponse.next();
  try {
    const session = await getIronSession<ISessionData>(
      request,
      res,
      sessionOptions,
    );
    if (!session?.session_id || !session?.user_id) {
      return NextResponse.json(
        { action: "error", message: "Session expired" },
        { status: 401 },
      );
    }
    const apiRes = await fetch(`${ApiBaseAddress}/api/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        session_id: session.session_id,
        user_id: session.user_id,
      }),
      credentials: "include",
    });

    if (!apiRes.ok) {
      if (apiRes.status === 401) {
        return NextResponse.json(
          { action: "logout", message: "Refresh token expired" },
          { status: 401 },
        );
      }
      throw new Error(`RefreshToken API failed with status ${apiRes.status}`);
    }
    const resJosn = await apiRes.json();
    const data = resJosn?.data;
    if (resJosn?.action === "success" && data?.access_token) {
      await setAuthCookie(data.access_token);
      session.token = data.access_token;
      await session.save();
      return NextResponse.json({
        action: "success",
        token: data.access_token,
      });
    }
    return NextResponse.json(
      { action: "error", message: "Failed to refresh token" },
      { status: 400 },
    );
  } catch (error: unknown) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      {
        action: "error",
        message:
          error instanceof Error ? error.message : "Unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
