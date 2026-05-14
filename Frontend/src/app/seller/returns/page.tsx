"use client";

import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import ReturnRequestsPage from "@modules/seller/returns/ReturnRequestsPage";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function StockPage() {
  return <ReturnRequestsPage />;
}
