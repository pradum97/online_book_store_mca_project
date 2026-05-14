import AxiosClient from "@/webEndPoints/clients/axios-client";
import { IUploadMedia } from "./IuploadWEB";

const commonPath = "/api/v1/upload";

export const UploadMediaEP = async (
  resData: IUploadMedia,
  files: File[] = []
) => {
  try {
    const formData = new FormData();
    formData.append("ref_id", resData.ref_id.toString());
    formData.append("source", resData.source ?? "");
    formData.append("folder", resData.folder ?? "");

    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await AxiosClient.post(`${commonPath}/UploadMedia`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res;
  } catch {
    return { action: "error", title: "Something went wrong." };
  }
};

export const GetReminderByIdEP = async (ref_id: number, source: string) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/GetFilesByRef?ref_id=${ref_id}&source=${source}`
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
