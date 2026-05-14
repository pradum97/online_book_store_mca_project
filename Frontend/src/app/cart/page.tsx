"use client";

import CartPage from "@modules/cart/CartPage";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function page() {
  return <CartPage></CartPage>;
}
