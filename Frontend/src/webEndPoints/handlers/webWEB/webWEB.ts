import AxiosClient from "@/webEndPoints/clients/axios-client";
import { IExtendedPermissionRow, IGetAllWebPagesEP } from "./IwebWEB";

const commonPath = "/api/v1/web";

export const GetWebPagesEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/GetWebPages`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    console.log("error-", error);

    return error;
  }
};

export const GetAllWebPagesEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/GetAllWebPages`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    console.log("error-", error);
    return error;
  }
};

export const InsertUpdateWebPageEP = async (payload: IGetAllWebPagesEP) => {
  try {
    const res = await AxiosClient.post(
      `${commonPath}/InsertUpdateWebPage`,
      payload
    );
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    console.log("error-", error);
    return error;
  }
};

export const GetPermissionMappingEP = async ({
  user_type_id,
  user_id,
}: {
  user_type_id: number;
  user_id: number;
}) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/GetPermissionMapping?user_id=${user_id}&user_type_id=${user_type_id}`
    );
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    console.log("error-", error);
    return error;
  }
};

export const InsertUpdateUserPagePermissionEP = async (
  payload: IExtendedPermissionRow[]
) => {
  try {
    const res = await AxiosClient.post(
      `${commonPath}/InsertUpdateUserPagePermission`,
      payload
    );
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    console.log("error-", error);
    return error;
  }
};
