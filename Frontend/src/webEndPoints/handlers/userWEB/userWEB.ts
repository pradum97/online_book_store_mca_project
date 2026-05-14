import AxiosClient from "@/webEndPoints/clients/axios-client";
import {
  IAddressPayload,
  IGetAllUserTypesEP,
  IUpdateMyProfileEP,
} from "./IuserWEB";

const commonPath = "/api/v1/admin/user";

export const GetAllUsersEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/users`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetUserTypesEP = async (user_type_id: number = 0) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/GetUserTypes?user_type_id=${user_type_id}`,
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

export const GetUserByUserIdEP = async (user_id: number = 0) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/GetUserByUserId?user_id=${user_id}`,
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

export const GetUserByUserIdPopupEP = async (user_id: number = 0) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/GetUserByUserIdPopup?user_id=${user_id}`,
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

export const CheckUserStatusEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/CheckUserStatus`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetUserByUserTypeIdEP = async (user_type_id: number = 0) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/GetUserByUserTypeId?user_type_id=${user_type_id}`,
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

export const InsertUpdateUserTypeEP = async (resData: IGetAllUserTypesEP) => {
  try {
    const res = await AxiosClient.post(
      `${commonPath}/InsertUpdateUserType`,
      resData,
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

export const GetAllUserTypesEP = async (user_type_id: number = 0) => {
  try {
    const res = await AxiosClient.get(
      `${commonPath}/GetAllUserTypes?user_type_id=${user_type_id}`,
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

export const UpdateUserStatusEP = async (
  user_id: string,
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED",
) => {
  try {
    const res = await AxiosClient.patch(
      `${commonPath}/users/${user_id}/status`,
      { status },
    );

    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error: any) {
    return {
      action: "error",
      data: {},
      title: "Update Failed",
      message: error?.response?.data?.message || error.message,
    };
  }
};

export const UpdateMyProfileEP = async (payload: IUpdateMyProfileEP) => {
  try {
    const res = await AxiosClient.put(`${commonPath}/profile`, payload);

    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error: any) {
    return {
      action: "error",
      data: {},
      title: "Profile Update Failed",
      message: error?.response?.data?.message || error.message,
    };
  }
};

export const GetMyAddressesEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/my-addresses`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const AddAddressEP = async (payload: IAddressPayload) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/add-address`, payload);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error: any) {
    return {
      action: "error",
      data: {},
      title: "Insert Failed",
      message: error?.response?.data?.message || error.message,
    };
  }
};

export const UpdateAddressEP = async (id: string, payload: IAddressPayload) => {
  try {
    const res = await AxiosClient.put(
      `${commonPath}/update-address/${id}`,
      payload,
    );
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error: any) {
    return {
      action: "error",
      data: {},
      title: "Update Failed",
      message: error?.response?.data?.message || error.message,
    };
  }
};

export const SetDefaultAddressEP = async (id: string) => {
  try {
    const res = await AxiosClient.put(
      `${commonPath}/set-default-address/${id}`,
    );
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error: any) {
    return {
      action: "error",
      data: {},
      title: "Update Failed",
      message: error?.response?.data?.message || error.message,
    };
  }
};

export const DeleteAddressEP = async (id: string) => {
  try {
    const res = await AxiosClient.delete(`${commonPath}/delete-address/${id}`);

    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error: any) {
    return {
      action: "error",
      data: {},
      title: "Delete Failed",
      message: error?.response?.data?.message || error.message,
    };
  }
};
