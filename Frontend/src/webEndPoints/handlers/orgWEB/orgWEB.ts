import AxiosClient from "@AxoisClient/axios-client";

const commonPath = "/api/v1/org";

export const GetOrganizationsEP = async (org_id: number = 0) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/GetOrganizations?org_id=${org_id}`
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
