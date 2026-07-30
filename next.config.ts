import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Keep production builds stable on memory-constrained development machines.
  experimental: {
    cpus: 1,
  },
  typescript: {
    // Dev route declarations live under `.next/dev` and can be regenerated
    // while a production build is running. Keep them out of the build graph.
    tsconfigPath: isProduction ? "tsconfig.build.json" : "tsconfig.json",
  },
  serverExternalPackages: [
    "@huggingface/transformers",
    "@napi-rs/canvas",
    "pdfjs-dist",
    "sharp",
    "tesseract.js",
    "unpdf",
  ],
};

export default nextConfig;
