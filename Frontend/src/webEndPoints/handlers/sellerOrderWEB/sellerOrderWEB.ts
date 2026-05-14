import AxiosClient from "@/webEndPoints/clients/axios-client";

const commonPath = "/api/v1/seller-order";

export const GetSellerOrdersEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/orders`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetSellerOrderByIdEP = async (orderId: string) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/orders/${orderId}`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetSellerOrderItemsEP = async (orderId: string) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/orders/${orderId}/items`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const UpdateOrderItemStatusEP = async (
  order_item_id: string,
  data: { item_status: string },
) => {
  try {
    const res = await AxiosClient.patch(
      `${commonPath}/orders/item/${order_item_id}/status`,
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

export const AdminGetAllReturnsEP = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await AxiosClient.get(
      `${commonPath}/orders/returns?${query.toString()}`,
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

export const AdminGetReturnStatsEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/orders/returns/stats`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export interface ReturnActionPayload {
  action: "APPROVED" | "REJECTED" | "PICKED_UP" | "REFUNDED";
  remark?: string;
}

export const AdminActionReturnEP = async (
  returnId: string,
  data: ReturnActionPayload,
) => {
  try {
    const res = await AxiosClient.patch(
      `${commonPath}/orders/returns/${returnId}/action`,
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
