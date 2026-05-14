"use client";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import HomeBookList from "@container/HomeBookList";
ModuleRegistry.registerModules([AllCommunityModule]);

export default function BookPage() {
  return <HomeBookList />;
}
