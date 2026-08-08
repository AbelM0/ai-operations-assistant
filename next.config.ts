import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const onnxRuntimeLinuxFiles = [
  "./node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1",
  "./node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v6/linux/x64/onnxruntime_binding.node",
];
const sharpLinuxFiles = [
  "./node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-linux-x64/**/*",
  "./node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*",
];
const documentProcessingLinuxFiles = [
  ...onnxRuntimeLinuxFiles,
  ...sharpLinuxFiles,
];

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
  outputFileTracingIncludes: {
    "/api/chat": onnxRuntimeLinuxFiles,
    "/api/documents": documentProcessingLinuxFiles,
    "/api/documents/\\[documentId\\]": documentProcessingLinuxFiles,
  },
};

export default nextConfig;
