import { ISessionData } from "@app/auth/lib/session";

let currentUserId: string | null = null;

export const setSession = (session: ISessionData) => {
  currentUserId =
    session?.user_id && session.user_id !== "" ? session.user_id : null;
};

export const getSessionUserId = () => currentUserId;
