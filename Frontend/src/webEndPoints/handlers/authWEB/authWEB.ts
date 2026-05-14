import AxiosClient from "@/webEndPoints/clients/axios-client";
import { IResetPasswordEP, IValidateSignupEP } from "./IauthWEB";
import { ISignupForm } from "@modules/admin/user/signup/SignupBox";
const commonPath = "/api/v1/auth";

export const SignupEP = async (body: ISignupForm) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/signup`, body);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const LogoutEP = async (session_id: string) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/logout?session_id=${session_id}`,
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

export const CheckUserAvailabilityEP = async (body: IValidateSignupEP) => {
  try {
    const res = await AxiosClient.post(
      `${commonPath}/check-availability`,
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

export const GetProfileEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/me`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export interface ISendOtpEP {
  send_to: string;
  source: "SIGNUP" | "LOGIN" | "FORGOT_PASSWORD";
  otp_type: "EMAIL" | "PHONE";
}

export const SendOtpEP = async (body: ISendOtpEP) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/otp/send`, body);

    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export interface IResendOtpEP {
  reference_no: string;
}

export const ResendOtpEP = async (body: IResendOtpEP) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/otp/resend`, body);

    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export interface IVerifyOtpEP {
  reference_no: string;
  otp: string;
}

export const VerifyOtpEP = async (body: IVerifyOtpEP) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/otp/verify`, body);

    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const ResetPasswordEP = async (body: IResetPasswordEP) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/password/reset`, body);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};
