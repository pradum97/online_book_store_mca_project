import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IGetWebPagesEP } from "@webEndPoints/handlers/webWEB/IwebWEB";

interface MenuState {
  items: IGetWebPagesEP[];
  loading: boolean;
}

const initialState: MenuState = {
  items: [],
  loading: false,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenuItems(state, action: PayloadAction<IGetWebPagesEP[]>) {
      state.items = action.payload;
    },
    clearMenuItems(state) {
      state.items = [];
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setMenuItems, clearMenuItems, setLoading } = menuSlice.actions;
export default menuSlice.reducer;
