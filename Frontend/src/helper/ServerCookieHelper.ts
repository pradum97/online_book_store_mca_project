"use server";
import { cookies } from "next/headers";

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  const accessTokenExpiryMinutes = parseInt(
    process.env.JWT_EXPIRES_IN?.replace("m", "") || "15",
    10,
  );

  const maxAgeSeconds = accessTokenExpiryMinutes * 60;

  const authTokenName = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME;
  const isProd = process.env.NODE_ENV === "production";

  console.log("Setting_auth_cookie (server):", token);

  if (authTokenName) {
    cookieStore.set({
      name: authTokenName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAgeSeconds,
      path: "/",
      sameSite: isProd ? "none" : "lax",
    });
  }

  console.log(
    "Auth cookie set (server):",
    token,
    "Expires in minutes:",
    accessTokenExpiryMinutes,
  );
}
