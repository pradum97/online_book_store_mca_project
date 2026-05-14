export async function isAuthValidServer(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const { jwtVerify } = await import("jose");

  const cookieStore = await cookies();
  const token = cookieStore.get(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME!,
  )?.value;

  if (!token) return false;

  try {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secretKey);
    return true;
  } catch {
    return false;
  }
}
