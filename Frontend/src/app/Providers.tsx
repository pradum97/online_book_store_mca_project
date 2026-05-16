"use client";
import * as React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@appearance/theme";
import ToastProvider from "@/providers/ToastProvider";
import LocalizationRegistry from "@registry/LocalizationRegistry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@redux/store/store";
// import MenuLoader from "@/providers/MenuLoader";
import { ConfirmationDialogProvider } from "@/providers/ConfirmationDialogProvider";

import dynamic from "next/dynamic";
import ClientWrapper from "@/providers/ClientWrapper";
import Footer from "@container/Footer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DrawerHideLayout, ShowFooter } from "@config/appSetting";
import { GlobalInit } from "@/utils/GlobalInit";
import Navbar from "@container/navbar/Navbar";
import useSession from "./auth/session/useSession";
import { useRoleGuard } from "@hooks/useRoleGuard";
import { IRole } from "./auth/lib/session";
import AccessDenied from "@/components/AccessDenied";
import PermissionLoading from "@/components/PermissionLoading";

export function ProvidersContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, isLoading: isSessionLoading } = useSession();

  const { isAllowed, isProtected } = useRoleGuard(
    session.user_type_code as IRole,
  );

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      }),
  );

  React.useEffect(() => {
    const q = searchParams.get("q");

    if (pathname !== "/" && q) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");

      const newQuery = params.toString();
      const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(newUrl);
    }
  }, [pathname, searchParams]);

  const isLoading = isSessionLoading;
  const showAccessDenied = !isLoading && isProtected && !isAllowed;
  const showPermissionLoading = isLoading;

  console.log("showAccessDenied---", isAllowed);

  return (
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationRegistry>
          <QueryClientProvider client={queryClient}>
            <GlobalInit />
            {/* <MenuLoader /> */}
            {!DrawerHideLayout.includes(pathname) && <Navbar />}

            <ConfirmationDialogProvider>
              <ClientWrapper>
                {showPermissionLoading ? (
                  <PermissionLoading />
                ) : showAccessDenied ? (
                  <AccessDenied />
                ) : (
                  children
                )}
                <Footer />

                <div id="modal-root"></div>
              </ClientWrapper>
            </ConfirmationDialogProvider>
          </QueryClientProvider>
        </LocalizationRegistry>
        <ToastProvider />
      </ThemeProvider>
    </ReduxProvider>
  );
}
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={null}>
      <ProvidersContent>{children}</ProvidersContent>
    </React.Suspense>
  );
}
