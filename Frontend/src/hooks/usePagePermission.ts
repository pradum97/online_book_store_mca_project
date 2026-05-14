"use client";
import useSWR from "swr";
import { usePathname } from "next/navigation";
import { CheckUserPagePermissionEP } from "@webEndPoints/handlers/permissionWEB/permissionWEB";
import { ICheckUserPagePermissionEP } from "@webEndPoints/handlers/permissionWEB/IpermissionWEB";
import React from "react";
import useSession from "@app/auth/session/useSession";
import { isRefreshing, onRefreshChange } from "@AxoisClient/axios-client";

export interface IPermissions {
  can_add: boolean;
  can_edit: boolean;
  can_view: boolean;
  can_delete: boolean;
  can_upload: boolean;
  can_download: boolean;
  can_approved: boolean;
  can_assigned: boolean;
  can_view_status: boolean;
  can_view_more: boolean;
  can_export_excel: boolean;
  can_export_pdf: boolean;
  is_self_view: boolean;
  can_import: boolean;
}

const convertFlagsToBoolean = (
  data: ICheckUserPagePermissionEP["data"],
): IPermissions => ({
  can_add: !!data?.can_add,
  can_edit: !!data?.can_edit,
  can_view: !!data?.can_view,
  can_delete: !!data?.can_delete,
  can_upload: !!data?.can_upload,
  can_download: !!data?.can_download,
  can_approved: !!data?.can_approved,
  can_assigned: !!data?.can_assigned,
  can_view_status: !!data?.can_view_status,
  can_view_more: !!data?.can_view_more,
  can_export_excel: !!data?.can_export_excel,
  can_export_pdf: !!data?.can_export_pdf,
  is_self_view: !!data?.is_self_view,
  can_import: !!data?.can_import,
});

const waitForRefresh = async () => {
  if (!isRefreshing) return;
  return new Promise<void>((resolve) => {
    const check = setInterval(() => {
      if (!isRefreshing) {
        clearInterval(check);
        resolve();
      }
    }, 200);
  });
};

const fetcher = async ([userId, path]: [number, string]) => {
  await waitForRefresh();

  try {
    const res = await CheckUserPagePermissionEP(path);

    const normalized =
      res?.action === "success" && res?.type === "PERMISSION_GRANTED"
        ? {
            hasAccess: true,
            permissions: convertFlagsToBoolean(res.data),
            title: res.title ?? "Page",
            message: null,
          }
        : {
            hasAccess: false,
            permissions: undefined,
            title: res?.title ?? "Access Denied",
            message:
              res?.message?.message ?? "You are not allowed to view this page.",
          };

    localStorage.setItem(
      `user_${userId}_permissions_${path}`,
      JSON.stringify({ data: normalized, savedAt: Date.now() }),
    );

    return normalized;
  } catch (err) {
    console.warn("⚠️ Network error while fetching permissions:", err);
    return null;
  }
};

export const usePagePermission = (customPath?: string) => {
  const path = usePathname();
  const { session } = useSession();
  const userId = session?.user_id;

  const pathname = customPath ?? path;

  const cachedData = React.useMemo(() => {
    if (!userId) return null;
    try {
      const cached = localStorage.getItem(
        `user_${userId}_permissions_${pathname}`,
      );
      if (!cached) return null;
      const parsed = JSON.parse(cached);

      if (
        parsed?.savedAt &&
        Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000
      ) {
        localStorage.removeItem(`user_${userId}_permissions_${pathname}`);
        return null;
      }

      return parsed.data || null;
    } catch {
      return null;
    }
  }, [pathname, userId]);

  const [refreshing, setRefreshing] = React.useState(isRefreshing);

  const { data, error, isValidating } = useSWR(
    userId ? [userId, pathname] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      dedupingInterval: 5000,
      fallbackData: cachedData,
    },
  );

  React.useEffect(() => {
    const cb = (val: boolean) => {
      setRefreshing(val);
    };
    onRefreshChange.push(cb);
    return () => {
      const index = onRefreshChange.indexOf(cb);
      if (index > -1) onRefreshChange.splice(index, 1);
    };
  }, []);

  const finalData = data ?? cachedData;

  const isLoading =
    (!data && !cachedData) ||
    (isValidating && !finalData) ||
    (!finalData && refreshing);

  if (!userId) {
    return {
      loading: false,
      hasAccess: true,
      permissions: undefined,
      title: null,
      message: null,
    };
  }

  return {
    loading: isLoading,
    hasAccess: finalData?.hasAccess ?? null,
    permissions: finalData?.permissions,
    title: finalData?.title,
    message: error
      ? cachedData
        ? "You're offline."
        : error.message
      : finalData?.message,
  };
};
