import AxiosClient from "@/webEndPoints/clients/axios-client";
import { IGetReceiptEP, IDownloadReceiptEP } from "./IreceiptWEB";
import { downloadPdf } from "@/utils/CommonUtils";

const commonPath = "/api/v1/receipt";

const handleResponse = (res: any) => res?.data;

const handleError = (error: any) => ({
  action: "error",
  data: null,
  title: "Request Failed",
  message: error?.response?.data?.message || error.message,
});

export const GetReceiptEP = async ({ orderId }: IGetReceiptEP) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/${orderId}/receipt`);
    return handleResponse(res);
  } catch (error) {
    return handleError(error);
  }
};

export const DownloadReceiptEP = async ({
  orderId,
  flag,
}: IDownloadReceiptEP) => {
  try {
    const blob = (await AxiosClient.get(
      `${commonPath}/${orderId}/receipt/download`,
      {
        params: { flag },
        responseType: "blob",
      },
    )) as unknown as Blob;

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => window.URL.revokeObjectURL(url), 3000);
  } catch (err) {
    return handleError(err);
  }
};
