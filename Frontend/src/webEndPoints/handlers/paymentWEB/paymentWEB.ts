import AxiosClient from "@/webEndPoints/clients/axios-client";
import {
  IVerifyPaymentEP,
  IRetryPaymentEP,
  IInitiatePaymentEP,
} from "./IpaymentWEB";

const commonPath = "/api/v1/payment";

const handleResponse = (res: any) => res?.data;

const handleError = (error: any) => ({
  action: "error",
  data: null,
  title: "Request Failed",
  message: error?.response?.data?.message || error.message,
});

export const InitiatePaymentEP = async (data: IInitiatePaymentEP) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/payments/initiate`, data);
    return handleResponse(res);
  } catch (error) {
    return handleError(error);
  }
};

export const VerifyPaymentEP = async (data: IVerifyPaymentEP) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/payments/verify`, data);
    return handleResponse(res);
  } catch (error) {
    return handleError(error);
  }
};

export const RetryPaymentEP = async (data: IRetryPaymentEP) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/payments/retry`, data);
    return handleResponse(res);
  } catch (error) {
    return handleError(error);
  }
};

export const GetPaymentEP = async (paymentId: string) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/payments/${paymentId}`);
    return handleResponse(res);
  } catch (error) {
    return handleError(error);
  }
};

export const GetPaymentsByOrderEP = async ({
  orderId,
}: {
  orderId: string;
}) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/payments/order/${orderId}`,
    );
    return handleResponse(res);
  } catch (error) {
    return handleError(error);
  }
};
