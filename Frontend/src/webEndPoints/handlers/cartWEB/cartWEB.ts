import AxiosClient from "@/webEndPoints/clients/axios-client";

const commonPath = "/api/v1/cart";

export const GetCartEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const AddToCartEP = async (body: {
  book_id: string;
  stock_id: string;
  quantity: number;
}) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/items`, body);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const UpdateCartItemEP = async (
  cart_item_id: string,
  body: { quantity: number },
) => {
  try {
    const res = await AxiosClient.patch(
      `${commonPath}/items/${cart_item_id}`,
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

export const DeleteCartItemEP = async (cart_item_id: string) => {
  try {
    const res = await AxiosClient.delete(`${commonPath}/items/${cart_item_id}`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const ClearCartEP = async () => {
  try {
    const res = await AxiosClient.delete(`${commonPath}/clear`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetCartBillingEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/billing`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};
