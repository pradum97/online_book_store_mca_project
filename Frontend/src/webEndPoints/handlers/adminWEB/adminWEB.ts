import AxiosClient from "@webEndPoints/clients/axios-client";

const commonPath = "/api/v1/admin";

export interface IGetAllUsersEP {
  user_id: string;
  full_name: string;
  email: string;
  mobile: string;
  user_type_code: "USER" | "SELLER" | "ADMIN";
  is_suspended: boolean;
  created_date: string;
}

export interface IGetAllUsersResponse {
  users: IGetAllUsersEP[];
  summary: {
    total: number;
    active: number;
    suspended: number;
  };
}

export const GetAllUsersEP = async (): Promise<
  { action: string; data: IGetAllUsersResponse } | any
> => {
  try {
    const res = await AxiosClient.get(`${commonPath}/users`);
    return res;
  } catch (error) {
    return error;
  }
};
