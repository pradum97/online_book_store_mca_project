import { IRole } from "@app/auth/lib/session";

export interface RoleConfigItem {
  showSearch: boolean;
  items: string[];
}
export type RoleConfig = {
  [key in IRole]: RoleConfigItem;
};
export const roleConfig: RoleConfig = {
  GUEST: {
    showSearch: true,
    items: ["browseBooks", "categories", "cart", "login", "signup"],
  },

  CUSTOMER: {
    showSearch: true,
    items: ["browseBooks", "categories", "cart", "userMenu"],
  },

  SELLER: {
    showSearch: true,
    items: [
      "dashboard",
      "myBooks",
      "inventory",
      "orders",
      "returns",
      "userMenu",
    ],
  },

  ADMIN: {
    showSearch: false,
    items: ["dashboard", "users", "sellers", "userMenu"],
  },
};
