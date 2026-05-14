import AxiosClient from "@/webEndPoints/clients/axios-client";

const commonPath = "/api/v1/permission";

export const CheckUserPagePermissionEP = async (webPageUrlName: string) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/CheckUserPagePermission?web_page_url=${webPageUrlName}`
    );
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    console.log("error-", error);

    return error;
  }
};
