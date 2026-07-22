import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
