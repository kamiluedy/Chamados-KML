import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Chamados-KML",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
