"use client";
import BookListPage from "@modules/book/BookListPage";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function Page() {
  return <BookListPage />;
}
