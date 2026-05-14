import { IRole } from "@app/auth/lib/session";

export const routeAccessConfig: Record<string, IRole[]> = {
  "/cart": ["CUSTOMER"],
  "/checkout": ["CUSTOMER"],
  "/my-addresses": ["CUSTOMER"],
  "/my-order": ["CUSTOMER"],

  "/admin": ["ADMIN"],

  "/seller": ["SELLER"],

  "/apply-seller-application": ["CUSTOMER", "SELLER"],

  "/admin/dashboard": ["ADMIN"],
  "/seller/dashboard": ["SELLER"],
};
