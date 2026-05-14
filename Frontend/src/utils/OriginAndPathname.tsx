"use client";

import { usePathname } from "next/navigation";
import Head from "next/head";

export default function OriginAndPathname() {
  const pathname = usePathname();
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <Head>
      <meta property="og:url" content={`${origin}${pathname}`} />
    </Head>
  );
}
