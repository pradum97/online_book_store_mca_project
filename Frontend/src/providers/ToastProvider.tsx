"use client";

import React, { useEffect } from "react";
import { ToastContainer, Slide, toast } from "react-toastify";
import { usePathname } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";

const ToastProvider = () => {
  const pathname = usePathname();

  useEffect(() => {
    toast.dismiss();
  }, [pathname]);

  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      draggable
      pauseOnHover
      pauseOnFocusLoss
      limit={1}
      stacked
      transition={Slide}
      theme="colored"
      className="custom-toast"
      style={{
        minHeight: "40px",
        padding: "6px 12px",
        fontSize: "14px",
        borderRadius: "8px",
        paddingRight: "10px",
      }}
    />
  );
};

export default ToastProvider;
