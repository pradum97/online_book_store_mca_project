import useSession from "@app/auth/session/useSession";

export function useAuth() {
  const { session, isLoading } = useSession();

  return {
    sessionUser: session,
    isAuthLoading: isLoading,
    isAuthValid: session.isLoggedIn ?? false,
  };
}
