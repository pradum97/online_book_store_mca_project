"use client";

import SellerListPage from "@modules/seller/SellerListPage";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function StockPage() {
  return <SellerListPage />;
}
