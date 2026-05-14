export interface IGetReceiptEP {
  orderId: string;
}

export interface IDownloadReceiptEP {
  orderId: string;
  flag: "CUSTOMER" | "SELLER";
}
