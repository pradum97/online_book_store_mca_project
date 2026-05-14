import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { ISessionData, sessionOptions } from "./session";

export async function requireSession() {
  const cookieStore = await cookies();
  const session: ISessionData = await getIronSession(
    cookieStore,
    sessionOptions
  );

  if (!session.user_id || session.user_id <= 0) {
    return null;
  }

  return session;
}
