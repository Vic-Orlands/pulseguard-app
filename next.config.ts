import type { NextConfig } from "next";
// import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com"],
  },
  // webpack: (config) => {
  // Add the Prisma plugin to the Webpack configuration
  // config.plugins.push(new PrismaPlugin());
  // return config;
  // }
};

export default nextConfig;
