"use client";

import SellerApplyPage from "@modules/seller/Sellerapplypage";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function StockPage() {
  return <SellerApplyPage />;
}
