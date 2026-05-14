import useSWR, { mutate as globalMutate } from "swr";
import useSWRMutation from "swr/mutation";
import { useRouter } from "next/navigation";
import { ISessionData, defaultSession } from "../lib/session";
import { toast } from "react-toastify";
import React from "react";
import { setSession } from "@/utils/sessionStore";

export default function useSession() {
  const router = useRouter();
  const sessionUrl = "/auth/session";

  const { data: session, isLoading } = useSWR<ISessionData>(
    sessionUrl,
    async () => {
      const res = await fetch(sessionUrl, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) return defaultSession;
      return res.json();
    },
    {
      fallbackData: defaultSession,
    },
  );

  React.useEffect(() => {
    setSession(session ?? defaultSession);
  }, [session]);

  async function doLogin(
    key: string,
    { arg }: { arg: { username_or_email: string; password: string } },
  ) {
    try {
      const res = await fetch(key, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        return { action: "error", title: "Login failed" };
      }

      const result = await res.json();

      if (result?.action !== "success") {
        toast[result?.action as "success"](result?.title);
      } else {
        await globalMutate(sessionUrl, undefined, { revalidate: true });
      }
      return result;
    } catch (e) {
      return {
        action: "error",
        title: "Unexpected error",
        message: e instanceof Error ? e.message : String(e),
      };
    }
  }

  async function doLogout() {
    await fetch(sessionUrl, {
      method: "DELETE",
      credentials: "include",
    });

    localStorage.clear();
    sessionStorage.clear();

    await globalMutate(sessionUrl, defaultSession, { revalidate: false });
    router.replace("/login");

    return { action: "success" };
  }

  const { trigger: login } = useSWRMutation(sessionUrl, doLogin, {
    revalidate: false,
  });

  const { trigger: logout } = useSWRMutation(sessionUrl, doLogout);

  return {
    session: session ?? defaultSession,
    isLoading,
    login,
    logout,
  };
}
