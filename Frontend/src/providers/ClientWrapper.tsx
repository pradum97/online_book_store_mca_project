"use client";

import { useAuth } from "@hooks/authentication/useAuth";
import UserStatusDialog from "@lib/UserStatusDialog";
import { CheckUserStatusEP } from "@webEndPoints/handlers/userWEB/userWEB";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

export interface IUserStatusResponse {
  user_status_code: string;
  status_name?: string;
  message?: string;
  user_id?: string | number;
}

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthValid } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [statusRes, setStatusRes] = useState<IUserStatusResponse>({
    user_status_code: "ACTIVE",
  });

  useEffect(() => {
    async function checkUserStatus() {
      try {
        const res = await CheckUserStatusEP();
        const data = res?.data;

        setStatusRes(data);

        console.log("setStatusRes-", data);

        if (
          data?.user_status_code !== "" &&
          data?.user_status_code !== "ACTIVE" &&
          isAuthValid === true &&
          pathname !== "/login" &&
          pathname !== "/"
        ) {
          setOpen(true);
        }
      } catch (err) {
        console.error("Error fetching user status:", err);
      }
    }
    if (isAuthValid) {
      checkUserStatus();
    }
  }, [pathname, isAuthValid]);

  return (
    <>
      {children}
      <UserStatusDialog
        open={open}
        userStatusCode={statusRes?.user_status_code ?? ""}
        statusName={statusRes?.status_name ?? ""}
        message={statusRes?.message ?? ""}
        onHandleClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
}
