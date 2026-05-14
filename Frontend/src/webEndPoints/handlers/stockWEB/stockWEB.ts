import AxiosClient from "@/webEndPoints/clients/axios-client";

const commonPath = "/api/v1/book";

export const CreateStockEP = async (data: any) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/stock`, data);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const UpdateStockEP = async (stock_id: string, data: any) => {
  try {
    const res = await AxiosClient.patch(
      `${commonPath}/stock/${stock_id}`,
      data,
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

export const GetSellerStockEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/stock`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetStockHistoryEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/stock/history`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const DeleteStockEP = async (stock_id: string) => {
  try {
    const res = await AxiosClient.delete(`${commonPath}/stock/${stock_id}`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};
