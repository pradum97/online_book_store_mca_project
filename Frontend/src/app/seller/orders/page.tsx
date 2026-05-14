"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { IORDER_STATUS } from "@container/navbar/RoleRenderer";
import OrderListPage from "@modules/orders/OrderListPage";

ModuleRegistry.registerModules([AllCommunityModule]);

function StockPageContent() {
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") ?? "ALL") as IORDER_STATUS;

  return <OrderListPage status={status} />;
}

export default function StockPage() {
  return (
    <Suspense fallback={null}>
      <StockPageContent />
    </Suspense>
  );
}
