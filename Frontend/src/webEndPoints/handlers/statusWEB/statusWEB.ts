import AxiosClient from "@/webEndPoints/clients/axios-client";
import { IGetAllStatusSetsEP } from "./IstatusWEB";
import { IDefault } from "@modules/setting/master/status/CreateStatusDrawer";

const commonPath = "/api/v1/status";

export const GetAllStatusSetsEP = async (flag: "ACTIVE" | "ALL") => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/GetAllStatusSets?flag=${flag}`
    );
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const InsertUpdateStatusSetEP = async (data: IGetAllStatusSetsEP) => {
  try {
    const res = await AxiosClient.post(
      `${commonPath}/InsertUpdateStatusSet`,
      data
    );
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetAllStatusValueEP = async (statusSetIdWatch: number) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/GetAllStatusValue?status_set_id=${statusSetIdWatch ?? 0}`
    );
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const InsertUpdateStatusValueEP = async (data: IDefault) => {
  try {
    const res = await AxiosClient.post(
      `${commonPath}/InsertUpdateStatusValue`,
      data
    );
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};
