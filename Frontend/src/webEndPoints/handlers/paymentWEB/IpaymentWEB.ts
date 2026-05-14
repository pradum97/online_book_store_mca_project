export interface IInitiatePaymentEP {
  order_id: string;
  payment_mode_id: string;
  payment_fields?: Record<string, any>;
  reference_number?: string;
  transaction_id?: string;
  payment_note?: string;
  screenshot_url?: string;
}

export interface IVerifyPaymentEP {
  payment_id: string;
  gateway_reference: string;
  status: "SUCCESS" | "FAILED";
}

export interface IRetryPaymentEP {
  payment_id: string;
}

export interface IGetPaymentEP {
  paymentId: string;
}

export interface IGetPaymentsByOrderEP {
  orderId: string;
}
