import AxiosClient from "@/webEndPoints/clients/axios-client";
import {
  IForgotPasswordCheckUserEP,
  IGenerateOTPEP,
  IReSendOTPEP,
  IVerifyOTPEP,
} from "./IotpWEB";

const commonPath = "/api/v1/auth/otp";

export const GenerateOTPEP = async (resData: IGenerateOTPEP) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/send`, resData);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const ReSendOTPEP = async (resData: IReSendOTPEP) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/resend`, resData);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const VerifyOTPEP = async (resData: IVerifyOTPEP) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/verify`, resData);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};
