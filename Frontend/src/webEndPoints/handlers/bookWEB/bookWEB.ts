import AxiosClient from "@/webEndPoints/clients/axios-client";
import { BookFormValues } from "@modules/book/Addbookpage";
const commonPath = "/api/v1/book";

export const GetSellerBookListEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/seller-books`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const CreateBookEP = async (body: BookFormValues) => {
  try {
    const res = await AxiosClient.post(`${commonPath}/books`, body);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const UpdateBookEP = async (id: string, body: BookFormValues) => {
  try {
    const res = await AxiosClient.patch(`${commonPath}/books/${id}`, body);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetCategoriesEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/categories`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetUOMsEP = async () => {
  try {
    const res = await AxiosClient.get(`${commonPath}/uoms`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetBookByIdEP = async (id: string) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/books/${id}`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error: any) {
    return {
      action: "error",
      message: error.message,
    };
  }
};

export const GetBookEditDataEP = async (id: string) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/books/${id}/edit-data`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error: any) {
    return {
      action: "error",
      message: error.message,
    };
  }
};

export const DeleteBookEP = async (id: string) => {
  try {
    const res = await AxiosClient.delete(`${commonPath}/books/${id}`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetBookImagesEP = async (book_id: string) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/books/${book_id}/images`);
    return res?.data ?? res;
  } catch (error) {
    return error;
  }
};

export const UploadBookImagesEP = async (book_id: string, files: File[]) => {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    const res = await AxiosClient.post(
      `${commonPath}/books/${book_id}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
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

export const DeleteBookImageEP = async (image_id: string) => {
  try {
    const res = await AxiosClient.delete(
      `${commonPath}/books/images/${image_id}`,
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
export const GetBookUOMsEP = async (book_id: string) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/books/${book_id}/uoms`);
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const GetAllBooksEP = async (params?: {
  q?: string;
  author?: string;
  category_id?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/books`, {
      params,
    });

    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};

export const AutocompleteBooksEP = async (q: string) => {
  try {
    const res = await AxiosClient.get(`${commonPath}/books/autocomplete`, {
      params: { q },
    });
    try {
      return res;
    } catch {
      return { ...res.data };
    }
  } catch (error) {
    return error;
  }
};
