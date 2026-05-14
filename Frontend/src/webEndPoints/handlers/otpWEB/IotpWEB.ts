export interface IGenerateOTPEP {
  send_to: string;
  source: string;
  otp_type: "EMAIL" | "PHONE";
}

export interface IReSendOTPEP {
  reference_no: string;
}

export interface IVerifyOTPEP {
  reference_no: string;
  otp: string;
}

export interface IForgotPasswordCheckUserEP {
  username: string;
}
