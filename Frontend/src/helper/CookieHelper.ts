import {
  getCookie as getCookieNext,
  setCookie as setCookieNext,
  deleteCookie as deleteCookieNext,
} from "cookies-next";

export const cookieHelper = {
  async get(name: string) {
    return (await getCookieNext(name)) as string | undefined;
  },

  async getAuthToken() {
    const token = await cookieHelper.get(
      process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? "accessToken",
    );
    return token;
  },

  set(
    name: string,
    value: string,
    options?: Parameters<typeof setCookieNext>[2],
  ) {
    setCookieNext(name, value, options);
  },

  delete(name: string, options?: Parameters<typeof deleteCookieNext>[1]) {
    deleteCookieNext(name, options);
  },
};
