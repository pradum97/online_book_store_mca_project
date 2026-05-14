"use client";

import { useSearchParams } from "next/navigation";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { IORDER_STATUS } from "@container/navbar/RoleRenderer";
import OrderListPage from "@modules/orders/OrderListPage";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function StockPage() {
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") ?? "ALL") as IORDER_STATUS;

  return <OrderListPage status={status} />;
}
