"use client";

import BookDetailsPage from "@container/BookDetailsPage";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function BookPage() {
  return <BookDetailsPage />;
}
