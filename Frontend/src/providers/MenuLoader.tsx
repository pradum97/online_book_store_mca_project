"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@redux/hooks/hooks";
import { setMenuItems } from "@redux/slice/menuSlice";
import { useAuth } from "@hooks/authentication/useAuth";
import { IGetWebPagesEP } from "@webEndPoints/handlers/webWEB/IwebWEB";
import { GetWebPagesEP } from "@webEndPoints/handlers/webWEB/webWEB";

const MenuLoader: React.FC = () => {
  // const dispatch = useAppDispatch();

  // const { isAuthValid } = useAuth();

  // const { data: menuItems = [] } = useQuery<IGetWebPagesEP[]>({
  //   queryKey: ["GetWebPagesEP", "MenuLoader"],
  //   enabled: isAuthValid === true,
  //   queryFn: async () => {
  //     const res = await GetWebPagesEP();
  //     return res?.data ?? [];
  //   },
  // });

  // React.useEffect(() => {
  //   if (menuItems.length > 0) {
  //     dispatch(setMenuItems(menuItems));
  //   }
  // }, [menuItems, dispatch]);

  return null;
};

//export default MenuLoader;
