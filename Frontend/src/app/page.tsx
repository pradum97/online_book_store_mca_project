"use client";

import TrendingBooks from "@container/TrendingBooks";
import React from "react";
import useSession from "./auth/session/useSession";
import SellerDashboard from "@modules/seller/dashboard/SellerDashboard";
import AdminDashboard from "@modules/admin/dashboard/AdminDashboard";

export const BookList = React.memo(() => (
  <>
    <TrendingBooks></TrendingBooks>
  </>
));

export default function Home() {
  const { session } = useSession();

  if (session?.user_type_code === "SELLER") {
    return <SellerDashboard></SellerDashboard>;
  }

  if (session?.user_type_code === "ADMIN") {
    return <AdminDashboard></AdminDashboard>;
  }

  return <BookList></BookList>;
}
