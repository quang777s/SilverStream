import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("movie/:title", "routes/movie-detail.tsx"),
] satisfies RouteConfig;
