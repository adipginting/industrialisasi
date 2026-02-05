import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loggedInUser: "",
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    loggedInUserAdded: (state, action) => {
      state.loggedInUser = action.payload;
    },
  },
});

export const { loggedInUserAdded } = loginSlice.actions;
export default loginSlice.reducer;
