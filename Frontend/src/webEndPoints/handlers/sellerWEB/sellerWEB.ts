import AxiosClient from "@webEndPoints/clients/axios-client";
import { ISellerDashboardStats, IUpdateSellerStatus } from "./IsellerWEB";

const commonPath = "/api/v1/seller";

export interface ISellerApplyForm {
  [key: string]: any;
}

export const ApplySellerEP = async (body: FormData) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/apply-seller`, body, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetSellerRequestStatusEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/request-status`);

    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetAllSellersEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/sellers`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetSellerByIdEP = async (id: string) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/sellers/${id}`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const UpdateSellerStatusEP = async (
  id: string,
  body: IUpdateSellerStatus,
) => {
  try {
    const res = await AxiosClient.post(
      `${commonPath}/sellers/${id}/status`,
      body,
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

export const DeleteSellerEP = async (id: string) => {
  try {
    const res = await AxiosClient.delete(`${commonPath}/sellers/${id}`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const CreateBookEP = async (body: any) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/books`, body);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const UpdateBookEP = async (id: string, body: any) => {
  try {
    const res = await AxiosClient.patch(`${commonPath}/books/${id}`, body);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const DeleteBookEP = async (id: string) => {
  try {
    const res = await AxiosClient.delete(`${commonPath}/books/${id}`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetSellerDashboardStatsEP = async (): Promise<
  { action: string; data: ISellerDashboardStats } | any
> => {
  try {
    const res = await AxiosClient.get(`${commonPath}/sellers/dashboard/stats`);
    return res;
  } catch (error) {
    return error;
  }
};
