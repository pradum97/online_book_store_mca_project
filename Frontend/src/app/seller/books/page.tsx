"use client";
import BookListPage from "@modules/book/Booklistpage";
import { useParams } from "next/navigation";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function BookPage() {
  const { id } = useParams();

  return <BookListPage />;
}
