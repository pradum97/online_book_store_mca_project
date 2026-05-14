"use client";

import SellerDetailPage from "@modules/seller/SellerDetailPage";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useParams } from "next/navigation";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function StockPage() {
  const params = useParams();

  return <SellerDetailPage />;
}
