import { IPermissions } from "@hooks/usePagePermission";

export interface ICheckUserPagePermissionEP {
  data: IPermissions;
  type: "PERMISSION_GRANTED" | "PERMISSION_DENIED";
  title: string;
  action: "success" | "error" | string;
  message: {
    message: string;
  } | null;
}
