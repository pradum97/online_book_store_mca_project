"use client";

import UserList from "@modules/admin/user/user_master/UserList";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function StockPage() {
  return <UserList />;
}
