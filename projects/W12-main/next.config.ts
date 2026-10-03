import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // pure static SPA: no server needed
  basePath: "/W12", // GitHub Pages project subpath
};

export default nextConfig;
