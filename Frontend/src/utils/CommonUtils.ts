import { getCookie } from "cookies-next/client";
import { format } from "date-fns";

export const DRAWER_WIDTH = 200;
export const COLLAPSED_WIDTH = 65;
export const APPBAR_HEIGHT = 38;

export const getAuthCookie = async () => {
  const token = getCookie(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "accessToken",
  );
  return token ?? "";
};

export const GLOBAL_SQL_DATE_FORMAT = "yyyy-MM-dd";
export const GLOBAL_DATE_FORMAT = "dd-MMM-yyyy";

export const GLOBAL_DATETIME_FORMAT = "dd-MMM-yyyy hh:mm a";

export const OTP_RESEND_DURATION = 60;

export const validatePassword = (password: string, confirmPassword: string) => {
  let msg = "",
    isValid = true;

  if (!/.{8,}/.test(password)) {
    msg = "At least 8 characters";
    isValid = false;
  }
  if (!/[A-Z]/.test(password)) {
    msg = "Include at least one uppercase letter";
    isValid = false;
  }
  if (!/[a-z]/.test(password)) {
    msg = "Include at least one lowercase letter";
    isValid = false;
  }
  if (!/[0-9]/.test(password)) {
    msg = "Include at least one number";
    isValid = false;
  }
  if (!/[!@#$%^&*]/.test(password)) {
    msg = "Include at least one special character";
    isValid = false;
  }
  if (password !== confirmPassword) {
    msg = "Passwords do not match";
    isValid = false;
  }
  return { message: msg, isValid: isValid };
};

export const toSqlDate = (date: Date | string | null) => {
  if (date && date !== "") {
    return format(new Date(date), GLOBAL_SQL_DATE_FORMAT);
  } else {
    return null;
  }
};

export const parseDate = (input: unknown): Date | null => {
  if (
    typeof input !== "string" &&
    typeof input !== "number" &&
    !(input instanceof Date)
  ) {
    return null;
  }

  const date = new Date(input);
  return isNaN(date.getTime()) ? null : date;
};

export const formatDateForFilename = (): string => {
  return format(new Date(), "dd_MMMM_yyyy_hh_mmaaa");
};

export const formatIndianNumberForWhatsApp = (
  rawNumber: string,
): string | null => {
  if (!rawNumber) return null;
  let digits = rawNumber.replace(/\D/g, "");
  digits = digits.replace(/^0+/, "");
  if (digits.length === 10) digits = "91" + digits;
  if (digits.length !== 12 || !digits.startsWith("91")) return null;
  return digits;
};

export const getDeviceType = (): "WEB" | "ANDROID" | "IOS" => {
  if (typeof navigator === "undefined") return "WEB";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "ANDROID";
  if (/iphone|ipad|ipod/i.test(ua)) return "IOS";

  return "WEB";
};
export const downloadPdf = ({
  blob,
  fileName,
}: {
  blob: Blob;
  fileName: string;
}) => {
  const pdfBlob = new Blob([blob], { type: "application/pdf" });

  const url = window.URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.pdf`;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => window.URL.revokeObjectURL(url), 3000);
};
