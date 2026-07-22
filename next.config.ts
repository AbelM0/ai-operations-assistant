import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@huggingface/transformers",
    "@napi-rs/canvas",
    "sharp",
    "tesseract.js",
    "unpdf",
  ],
};

export default nextConfig;
