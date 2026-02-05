import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./loginSlice.js";

export default configureStore({
  reducer: { login: loginReducer },
});
