import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Providers from "@/app/Providers";
import NextAppDirEmotionCacheProvider from "@registry/EmotionRegistry";
import "react-toastify/dist/ReactToastify.css";
import "@fontsource/inter";

import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "BookStore - Buy Books Online",
  description:
    "Explore a wide collection of books across genres. Buy books online easily with our modern bookstore platform.",
  robots: "index, follow",
  icons: {
    icon: "/favicon/favicon.svg",
  },
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-color-scheme="light" className={inter.className}>
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>

      <body>
        {/* <DisableConsole /> */}
        <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
          <Providers>{children}</Providers>
        </NextAppDirEmotionCacheProvider>
      </body>
    </html>
  );
}
