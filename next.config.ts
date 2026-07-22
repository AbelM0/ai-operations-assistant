import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production builds stable on memory-constrained development machines.
  experimental: {
    cpus: 1,
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
