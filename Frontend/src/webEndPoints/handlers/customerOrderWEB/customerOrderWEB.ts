import AxiosClient from "@/webEndPoints/clients/axios-client";

const commonPath = "/api/v1/order";

export const CreateOrderEP = async (data: { address_id: string }) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/orders`, data);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetMyOrdersWithItemsEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/orders/my-orders`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetOrdersEP = async () => {
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

export const GetOrderByIdEP = async (
  value: string,
  flag: "ORDER_ID" | "ORDER_NUMBER",
) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/orders/${value}?flag=${flag}`,
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

export const GetOrderItemsEP = async (orderId: string) => {
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

export const GetOrderStatusHistoryEP = async (orderId: string) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/orders/${orderId}/status-history`,
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

export const UpdateOrderItemStatusEP = async (
  order_item_id: string,
  data: { item_status: string },
) => {
  try {
    const res = await AxiosClient.patch(
      `${commonPath}/orders/${order_item_id}/status`,
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

export interface CreateReturnPayload {
  return_reason:
    | "DAMAGED_PRODUCT"
    | "WRONG_ITEM"
    | "NOT_AS_DESCRIBED"
    | "MISSING_PARTS"
    | "POOR_QUALITY"
    | "CHANGED_MIND"
    | "OTHER";
  return_sub_reason?: string;
  description?: string;
}

export const CreateReturnRequestEP = async (
  orderId: string,
  itemId: string,
  data: CreateReturnPayload,
) => {
  try {
    const res = await AxiosClient.post(
      `${commonPath}/orders/${orderId}/items/${itemId}/return`,
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

export const GetItemReturnStatusEP = async (
  orderId: string,
  itemId: string,
) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/orders/${orderId}/items/${itemId}/return`,
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

export const CancelOrderItemEP = async (
  orderId: string,
  orderItemId: string,
) => {
  try {
    const res = await AxiosClient.patch(
      `${commonPath}/orders/${orderId}/items/${orderItemId}/cancel`,
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
