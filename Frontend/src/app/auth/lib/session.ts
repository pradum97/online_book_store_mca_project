import { SessionOptions } from "iron-session";

export interface IAccountStatus {
  account_status_id: number;
  account_status_code: string;
  account_status_name: string;
  account_status_description: string;
}

export type IRole = "GUEST" | "CUSTOMER" | "SELLER" | "ADMIN";

export interface ISessionData {
  token: string;
  user_id: string;
  username: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile: string;
  email: string;
  dob: string | Date | undefined;
  gender: string;
  is_active: number;
  status: IAccountStatus | null;
  created_date: string | Date | undefined;
  full_name?: string;
  user_type_code?: IRole;
  session_id?: string;
  isLoggedIn: boolean;
}

export const defaultSession: ISessionData = {
  token: "",
  user_id: "",
  username: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  mobile: "",
  email: "",
  dob: undefined,
  gender: "",
  is_active: 0,
  status: null,
  created_date: undefined,
  session_id: "",
  isLoggedIn: false,
};

const refreshTokenExpiryDays = parseInt(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS?.replace("d", "") || "30",
  10,
);
const refreshTokenMaxAge = refreshTokenExpiryDays * 24 * 60 * 60;
const isProd = process.env.NODE_ENV === "production";
export const sessionOptions: SessionOptions = {
  password: "ONLINEBOOKTOREWHIZERMAIKALPRADUM",
  cookieName: "user",
  cookieOptions: {
    secure: isProd,
    maxAge: refreshTokenMaxAge,
    sameSite: isProd ? "none" : "lax",
  },
};
