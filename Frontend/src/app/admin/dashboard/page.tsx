"use client";

import AdminDashboard from "@modules/admin/dashboard/AdminDashboard";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Page() {
  return <AdminDashboard />;
}
