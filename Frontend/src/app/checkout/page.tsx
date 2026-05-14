"use client";

import CheckoutPage from "@modules/cart/Checkoutpage";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function Page() {
  return <CheckoutPage />;
}
