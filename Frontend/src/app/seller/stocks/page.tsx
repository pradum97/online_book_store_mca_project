"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StockListPage from "@modules/stock/Stocklistpage";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { ISTOCK_TYPE } from "@container/navbar/RoleRenderer";

ModuleRegistry.registerModules([AllCommunityModule]);

function StockPageContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") ?? "ALL") as ISTOCK_TYPE;

  return <StockListPage type={type} />;
}

export default function StockPage() {
  return (
    <Suspense fallback={null}>
      <StockPageContent />
    </Suspense>
  );
}
