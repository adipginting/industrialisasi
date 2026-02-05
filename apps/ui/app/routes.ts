import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [

  layout("./components/layout.tsx", [
    route("login", "./components/login.tsx"),
    route("register", "./components/register.tsx"),
    route("create-post", "./components/createPost.tsx"),
    index("routes/home.tsx"),
  ]),
] satisfies RouteConfig;
