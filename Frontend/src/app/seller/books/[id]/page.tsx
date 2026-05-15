"use client";

import BookDetailsPage from "@container/BookDetailsPage";
import { useParams } from "next/navigation";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function BookPage() {
  const { id } = useParams();

  return <BookDetailsPage />;
}
