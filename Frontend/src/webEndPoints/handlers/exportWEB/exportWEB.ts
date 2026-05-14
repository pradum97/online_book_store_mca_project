import AxiosClient from "@/webEndPoints/clients/axios-client";

const commonPath = "/api/v1/export";

export const ExportLeadExcelEP = async (json_filter: string) => {
  try {
    const res = await AxiosClient.post(
      `${commonPath}/ExportLeadExcel`,
      json_filter,
      {
        responseType: "blob",
      }
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

export const ExportLeadReportExcelEP = async (json_filter: string) => {
  try {
    const res = await AxiosClient.post(
      `${commonPath}/ExportLeadReportExcel`,
      json_filter,
      {
        responseType: "blob",
      }
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
