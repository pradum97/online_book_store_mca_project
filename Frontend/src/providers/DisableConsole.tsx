"use client";

import { useEffect } from "react";

export default function DisableConsole() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.log = () => {};
      console.debug = () => {};
      console.info = () => {};
      console.warn = () => {};
      console.error = () => {};
    }
  }, []);

  return null;
}
